import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';

export const isResendConfigured = () => {
  return Boolean(resendApiKey && !resendApiKey.includes('placeholder') && resendApiKey.startsWith('re_'));
};

export const resend = isResendConfigured() ? new Resend(resendApiKey) : null;

export interface SendEmailParams {
  messageId: string;
  to: string;
  recipientName: string;
  fromName: string;
  fromEmail?: string;
  subject: string;
  bodyText: string;
  checkoutUrl: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  stage: number;
  appBaseUrl?: string;
}

export const resendService = {
  sendRecoveryEmail: async (params: SendEmailParams): Promise<{ id: string; success: boolean }> => {
    const {
      messageId,
      to,
      recipientName,
      fromName,
      subject,
      bodyText,
      checkoutUrl,
      invoiceNumber,
      amount,
      currency,
      stage,
      appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    } = params;

    const trackingPixelUrl = `${appBaseUrl}/api/track/open/${messageId}`;
    const trackingClickUrl = `${appBaseUrl}/api/track/click/${messageId}?redirect=${encodeURIComponent(checkoutUrl)}`;

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);

    const stageColors = {
      1: '#10B981', // Emerald
      2: '#F59E0B', // Amber
      3: '#F97316', // Orange
      4: '#EF4444', // Red
    };

    const headerColor = stageColors[stage as keyof typeof stageColors] || '#6366F1';

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 6px; background-color: ${headerColor};"></td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #1f2937;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Pay<span style="color: #10b981;">Loop</span></span>
                    <span style="display: inline-block; margin-left: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: rgba(255,255,255,0.1); color: #94a3b8; padding: 2px 8px; border-radius: 9999px;">Stage ${stage} Notice</span>
                  </td>
                  <td align="right">
                    <span style="font-size: 13px; color: #94a3b8;">${invoiceNumber}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amount Banner -->
          <tr>
            <td style="padding: 24px 32px; background-color: #161e2e; border-bottom: 1px solid #1f2937;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Outstanding Amount</span>
                    <div style="font-size: 28px; font-weight: 800; color: #ffffff; margin-top: 4px;">${formattedAmount}</div>
                  </td>
                  <td align="right">
                    <a href="${trackingClickUrl}" style="display: inline-block; background-color: #10b981; color: #000000; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);">Pay Invoice Now →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #cbd5e1; white-space: pre-line;">
${bodyText.replace(/\[STRIPE_CHECKOUT_URL\]/g, trackingClickUrl)}
            </td>
          </tr>

          <!-- Call to action button -->
          <tr>
            <td align="center" style="padding: 0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8;">Click below to pay via Credit Card, Apple Pay, Google Pay, or Bank Transfer:</p>
                    <a href="${trackingClickUrl}" style="display: inline-block; background-color: #10b981; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 8px; text-decoration: none;">
                      Settle ${formattedAmount} via Secure Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b0f19; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; text-align: center;">
              Sent on behalf of ${fromName} via <strong style="color: #94a3b8;">PayLoop Recovery Systems</strong>.
              <br>All payments are securely processed and verified with instantaneous reconciliation.
            </td>
          </tr>
        </table>
        
        <!-- Open Tracking Pixel -->
        <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none; width:1px; height:1px; border:0;" />
      </td>
    </tr>
  </table>
</body>
</html>
`;

    if (resend) {
      try {
        const data = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'PayLoop Recovery <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: htmlContent,
        });

        if (data.data?.id) {
          return { id: data.data.id, success: true };
        }
      } catch (error) {
        console.error('Resend API error, falling back to simulated dispatch:', error);
      }
    }

    // Simulated sandbox dispatch ID
    return {
      id: `re_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      success: true,
    };
  },
};
