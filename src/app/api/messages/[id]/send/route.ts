import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resendService } from '@/lib/resend';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { subject: editedSubject, content: editedContent } = body;

    const messages = await db.getMessages();
    const message = messages.find((m) => m.id === id);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const invoice = await db.getInvoiceById(message.invoice_id);
    if (!invoice) {
      return NextResponse.json({ error: 'Associated invoice not found' }, { status: 404 });
    }

    const client = invoice.client || (await db.getClientById(invoice.client_id));
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const user = await db.getUser();
    const finalSubject = editedSubject || message.subject;
    const finalContent = editedContent || message.content;

    // Send via Resend
    const result = await resendService.sendRecoveryEmail({
      messageId: message.id,
      to: client.email,
      recipientName: client.name,
      fromName: user.business_name || user.name,
      subject: finalSubject,
      bodyText: finalContent,
      checkoutUrl: invoice.stripe_checkout_url || `/pay/${invoice.id}`,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.amount,
      currency: invoice.currency,
      stage: message.stage,
    });

    // Update message status in DB
    const updated = await db.updateMessage(message.id, {
      subject: finalSubject,
      content: finalContent,
      status: 'sent',
      sent_at: new Date().toISOString(),
      reviewed_by_user: true,
      resend_email_id: result.id,
    });

    return NextResponse.json({ success: true, message: updated, resendId: result.id });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
