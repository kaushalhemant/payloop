import { db } from '@/lib/db';
import { geminiService } from '@/lib/gemini';
import { resendService } from '@/lib/resend';
import { Invoice, MessageStage, Message } from '@/types';

export interface EscalationReport {
  timestamp: string;
  invoicesChecked: number;
  stagesAdvanced: number;
  messagesDrafted: number;
  messagesAutoSent: number;
  messagesQueuedForReview: number;
  details: {
    invoiceId: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    daysOverdue: number;
    stage: MessageStage;
    actionTaken: 'auto_sent' | 'queued_for_review' | 'paused' | 'already_sent';
    messageId?: string;
  }[];
}

export const runEscalationJob = async (referenceDate: Date = new Date()): Promise<EscalationReport> => {
  const user = await db.getUser();
  const invoices = await db.getInvoices();
  const existingMessages = await db.getMessages();

  const report: EscalationReport = {
    timestamp: new Date().toISOString(),
    invoicesChecked: 0,
    stagesAdvanced: 0,
    messagesDrafted: 0,
    messagesAutoSent: 0,
    messagesQueuedForReview: 0,
    details: [],
  };

  const refTime = referenceDate.getTime();

  for (const inv of invoices) {
    // Only process unpaid invoices
    if (inv.status === 'paid' || inv.status === 'cancelled') continue;

    report.invoicesChecked++;
    const dueTime = new Date(inv.due_date).getTime();
    const diffMs = refTime - dueTime;
    const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    // Determine appropriate stage
    let calculatedStage: MessageStage = 1;
    if (daysOverdue >= 30) {
      calculatedStage = 4;
    } else if (daysOverdue >= 14) {
      calculatedStage = 3;
    } else if (daysOverdue >= 7) {
      calculatedStage = 2;
    } else if (daysOverdue >= 1) {
      calculatedStage = 1;
    }

    const isOverdue = daysOverdue > 0;
    const newStatus = isOverdue ? 'overdue' : inv.status;
    const stageChanged = calculatedStage !== inv.current_stage || inv.days_overdue !== daysOverdue;

    if (stageChanged || (isOverdue && inv.status !== 'overdue')) {
      await db.updateInvoice(inv.id, {
        days_overdue: daysOverdue,
        current_stage: calculatedStage,
        status: newStatus,
      });
      if (calculatedStage !== inv.current_stage) {
        report.stagesAdvanced++;
      }
    }

    if (!isOverdue) continue;

    // Check if a message for this stage has already been sent or drafted
    const existingStageMessage = existingMessages.find(
      (m) => m.invoice_id === inv.id && m.stage === calculatedStage
    );

    const client = inv.client;
    if (!client) continue;

    // Autopilot determination: client override takes precedence, otherwise invoice/user setting
    const isAutopilot =
      client.autopilot_override !== null && client.autopilot_override !== undefined
        ? client.autopilot_override
        : inv.autopilot_enabled || user.autopilot_enabled;

    // Guardrail: Stages 3 & 4 require review unless explicitly autopilot-enabled
    const isFirmOrFinalStage = calculatedStage >= 3;
    const shouldRequireReview = inv.pause_auto_send || (isFirmOrFinalStage && !isAutopilot);

    if (!existingStageMessage) {
      // Draft AI message via Gemini
      const draft = await geminiService.draftRecoveryEmail({
        invoice: { ...inv, days_overdue: daysOverdue, current_stage: calculatedStage },
        client,
        freelancerName: user.name,
        freelancerBusiness: user.business_name,
        stage: calculatedStage,
      });

      const messageStatus = shouldRequireReview ? 'pending_review' : 'sent';

      // Create message in DB
      const createdMsg = await db.createMessage({
        invoice_id: inv.id,
        stage: calculatedStage,
        channel: 'email',
        subject: draft.subject,
        content: draft.content,
        status: messageStatus,
        reviewed_by_user: !shouldRequireReview,
        sent_at: shouldRequireReview ? undefined : new Date().toISOString(),
      });

      report.messagesDrafted++;

      if (!shouldRequireReview) {
        // Send email via Resend
        const emailResult = await resendService.sendRecoveryEmail({
          messageId: createdMsg.id,
          to: client.email,
          recipientName: client.name,
          fromName: user.business_name || user.name,
          subject: draft.subject,
          bodyText: draft.content,
          checkoutUrl: inv.stripe_checkout_url || `/pay/${inv.id}`,
          invoiceNumber: inv.invoice_number,
          amount: inv.amount,
          currency: inv.currency,
          stage: calculatedStage,
        });

        await db.updateMessage(createdMsg.id, {
          resend_email_id: emailResult.id,
        });

        report.messagesAutoSent++;
        report.details.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoice_number,
          clientName: client.name,
          amount: inv.amount,
          daysOverdue,
          stage: calculatedStage,
          actionTaken: 'auto_sent',
          messageId: createdMsg.id,
        });
      } else {
        report.messagesQueuedForReview++;
        report.details.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoice_number,
          clientName: client.name,
          amount: inv.amount,
          daysOverdue,
          stage: calculatedStage,
          actionTaken: inv.pause_auto_send ? 'paused' : 'queued_for_review',
          messageId: createdMsg.id,
        });
      }
    } else {
      report.details.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoice_number,
        clientName: client.name,
        amount: inv.amount,
        daysOverdue,
        stage: calculatedStage,
        actionTaken: 'already_sent',
        messageId: existingStageMessage.id,
      });
    }
  }

  return report;
};
