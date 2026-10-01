import { GoogleGenAI } from '@google/genai';
import { Client, Invoice, MessageStage, STAGE_RULES } from '@/types';

const geminiApiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = () => {
  return Boolean(geminiApiKey && !geminiApiKey.includes('placeholder'));
};

const ai = isGeminiConfigured() ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export interface DraftMessageParams {
  invoice: Invoice;
  client: Client;
  freelancerName: string;
  freelancerBusiness?: string;
  stage: MessageStage;
  customInstructions?: string;
}

export interface DraftedMessageResult {
  subject: string;
  content: string;
  stage: MessageStage;
  requiresReview: boolean;
  complianceNote?: string;
  modelUsed: string;
}

export const geminiService = {
  draftRecoveryEmail: async (params: DraftMessageParams): Promise<DraftedMessageResult> => {
    const { invoice, client, freelancerName, freelancerBusiness, stage, customInstructions } = params;
    const stageRule = STAGE_RULES[stage];
    const checkoutUrl = invoice.stripe_checkout_url || `/pay/${invoice.id}`;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(invoice.amount);

    const isConsumer = client.debtor_type === 'consumer';
    const complianceNotice = isConsumer
      ? 'NOTICE: This is a communication regarding an outstanding consumer obligation. Under fair collection standards, you have the right to dispute the validity of this debt or request verification within 30 days.'
      : 'Commercial debt governed under applicable B2B commercial agreement terms and late penalty clauses.';

    // Prompt engineering
    const systemPrompt = `You are PayLoop AI, an elite recovery strategist and communications assistant for freelancers and agencies.
Your goal is to write a highly effective, polite yet persuasive late-invoice recovery email.
The email must balance recovering payments quickly while preserving valuable client relationships whenever possible.

CONTEXT:
- Freelancer Name: ${freelancerName}
- Freelancer Company/Brand: ${freelancerBusiness || freelancerName}
- Client Contact Name: ${client.name}
- Client Company: ${client.company || client.name}
- Debtor Type: ${client.debtor_type.toUpperCase()} (${isConsumer ? 'Consumer/Individual' : 'B2B Commercial Client'})
- Baseline Relationship Tone: ${client.relationship_tone.toUpperCase()}
- Invoice Number: ${invoice.invoice_number}
- Invoice Amount: ${formattedAmount}
- Invoice Description: ${invoice.description}
- Due Date: ${invoice.due_date}
- Days Overdue: ${invoice.days_overdue} days
- Escalation Stage: Stage ${stage} (${stageRule.name} - ${stageRule.default_tone_modifier})
- Secure Payment Link: ${checkoutUrl}
- Required Compliance Disclaimer: ${complianceNotice}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ''}

STAGE-SPECIFIC GUIDANCE:
- Stage 1 (Gentle Reminder, 1-6 days overdue): Friendly, warm check-in. Assume it's an oversight. Ask if they need any PO details.
- Stage 2 (Follow-Up Nudge, 7-13 days overdue): Professional, clear, direct statement of overdue balance.
- Stage 3 (Firm Notice, 14-29 days overdue): Urgent, firm tone. Mention that services or accounts may be paused until resolved.
- Stage 4 (Final Demand, 30+ days overdue): Formal final demand. Legal/collections advisory notice. Strict deadline (e.g. 48-72 hours).

REQUIREMENTS:
1. Output format: Return JSON with "subject" and "content".
2. Include the direct payment link clearly formatted (e.g., 👉 Pay Now: ${checkoutUrl}).
3. Always include the required compliance disclaimer at the bottom if Stage 3 or 4, or if consumer debtor.
4. Keep paragraphs short and easily readable on mobile.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nDraft the email now as a valid JSON object with keys "subject" and "content".` }],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return {
            subject: parsed.subject || `Invoice ${invoice.invoice_number} Payment Reminder`,
            content: parsed.content || text,
            stage,
            requiresReview: stageRule.requires_review,
            complianceNote: complianceNotice,
            modelUsed: 'gemini-2.5-flash',
          };
        }
      } catch (error) {
        console.error('Gemini API call failed, using intelligent template fallback:', error);
      }
    }

    // High-quality deterministic fallback template
    return geminiService.generateFallbackTemplate(params, complianceNotice);
  },

  generateFallbackTemplate: (
    params: DraftMessageParams,
    complianceNotice: string
  ): DraftedMessageResult => {
    const { invoice, client, freelancerName, freelancerBusiness, stage } = params;
    const checkoutUrl = invoice.stripe_checkout_url || `/pay/${invoice.id}`;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(invoice.amount);

    let subject = '';
    let body = '';

    if (stage === 1) {
      subject = `Quick check-in: Invoice ${invoice.invoice_number} (${formattedAmount})`;
      body = `Hi ${client.name.split(' ')[0]},\n\nHope your week is going great!\n\nJust a quick, friendly reminder that invoice ${invoice.invoice_number} for ${invoice.description} (${formattedAmount}) was due on ${invoice.due_date}.\n\nYou can easily complete payment via credit card, ACH, or Apple Pay through our secure portal:\n\n👉 Settle Invoice Securely: ${checkoutUrl}\n\nPlease let me know if you need any updated details, receipts, or purchase orders.\n\nBest regards,\n${freelancerName}\n${freelancerBusiness || ''}`;
    } else if (stage === 2) {
      subject = `Payment Reminder: Invoice ${invoice.invoice_number} is past due (${formattedAmount})`;
      body = `Hello ${client.name},\n\nI am writing to follow up on invoice ${invoice.invoice_number} (${formattedAmount}), which is now ${invoice.days_overdue} days overdue (original due date: ${invoice.due_date}).\n\nTo keep our accounts current and prevent any service interruptions, please settle the outstanding balance at your earliest convenience:\n\n👉 Pay Now: ${checkoutUrl}\n\nIf you have already initiated this transfer, please send over the remittance advice so I can update our records.\n\nThank you,\n${freelancerName}\n${freelancerBusiness || ''}`;
    } else if (stage === 3) {
      subject = `URGENT: Overdue Account Notice — Invoice ${invoice.invoice_number} (${formattedAmount})`;
      body = `Dear ${client.name},\n\nThis is an urgent notice regarding invoice ${invoice.invoice_number} for ${formattedAmount}, which is now ${invoice.days_overdue} days past due.\n\nDespite previous reminders, we have not received payment or confirmation of scheduled disbursement. Continued non-payment may result in an immediate pause on active deliverables and assessment of standard late charges.\n\nPlease resolve this balance immediately using our online payment link:\n\n👉 Settle Balance: ${checkoutUrl}\n\n${complianceNotice}\n\nSincerely,\n${freelancerName}\n${freelancerBusiness || ''}`;
    } else {
      subject = `FINAL DEMAND: Immediate settlement required for Invoice ${invoice.invoice_number} (${formattedAmount})`;
      body = `FINAL NOTICE OF OVERDUE ACCOUNT\n\nTo: ${client.name} (${client.company || 'Account Holder'})\nDate: ${new Date().toLocaleDateString()}\nRe: Invoice ${invoice.invoice_number} | Outstanding Balance: ${formattedAmount}\n\nNotice is hereby given that invoice ${invoice.invoice_number} is now ${invoice.days_overdue} days overdue. All previous attempts to resolve this amicable matter remain unfulfilled.\n\nFINAL OPPORTUNITY TO RESOLVE:\nPlease remit the full amount within forty-eight (48) hours using the secure payment link below to avoid formal collection proceedings, credit reporting, or legal remedies:\n\n👉 Direct Settlement Link: ${checkoutUrl}\n\n${complianceNotice}\n\nSubmitted by,\n${freelancerName}\n${freelancerBusiness || 'PayLoop Automated Collections'}`;
    }

    return {
      subject,
      content: body,
      stage,
      requiresReview: STAGE_RULES[stage].requires_review,
      complianceNote: complianceNotice,
      modelUsed: 'payloop-smart-rules (deterministic engine)',
    };
  },
};
