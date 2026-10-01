import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripeService } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice_id } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    const invoice = await db.getInvoiceById(invoice_id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const client = invoice.client || (await db.getClientById(invoice.client_id));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripeService.createInvoiceCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.amount,
      currency: invoice.currency,
      clientEmail: client?.email,
      clientName: client?.name,
      successUrl: `${baseUrl}/pay/${invoice.id}?payment_status=success`,
      cancelUrl: `${baseUrl}/pay/${invoice.id}?payment_status=cancelled`,
    });

    await db.updateInvoice(invoice.id, {
      stripe_checkout_url: session.checkoutUrl,
      stripe_session_id: session.sessionId,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.checkoutUrl,
      sessionId: session.sessionId,
    });
  } catch (error: any) {
    console.error('Stripe checkout generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
