import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripeService } from '@/lib/stripe';

export async function GET() {
  try {
    const invoices = await db.getInvoices();
    return NextResponse.json({ invoices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      client_id,
      invoice_number,
      description = '',
      amount,
      currency = 'USD',
      issue_date = new Date().toISOString().split('T')[0],
      due_date,
      autopilot_enabled = false,
      pause_auto_send = false,
      notes = '',
    } = body;

    if (!client_id || !invoice_number || !amount || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, invoice_number, amount, due_date' },
        { status: 400 }
      );
    }

    const user = await db.getUser();
    const client = await db.getClientById(client_id);

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const numAmount = parseFloat(amount);
    const dueTime = new Date(due_date).getTime();
    const nowTime = new Date().getTime();
    const diffMs = nowTime - dueTime;
    const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const isOverdue = daysOverdue > 0;

    let currentStage = 1;
    if (daysOverdue >= 30) currentStage = 4;
    else if (daysOverdue >= 14) currentStage = 3;
    else if (daysOverdue >= 7) currentStage = 2;

    const tempId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate Stripe checkout session
    const checkoutResult = await stripeService.createInvoiceCheckoutSession({
      invoiceId: tempId,
      invoiceNumber: invoice_number,
      amount: numAmount,
      currency: currency.toLowerCase(),
      clientEmail: client.email,
      clientName: client.name,
      successUrl: `${baseUrl}/pay/${tempId}?payment_status=success`,
      cancelUrl: `${baseUrl}/pay/${tempId}?payment_status=cancelled`,
    });

    const createdInvoice = await db.createInvoice({
      user_id: user.id,
      client_id,
      invoice_number,
      description,
      amount: numAmount,
      currency: currency.toUpperCase(),
      issue_date,
      due_date,
      status: isOverdue ? 'overdue' : 'sent',
      days_overdue: daysOverdue,
      current_stage: currentStage as 1 | 2 | 3 | 4,
      stripe_checkout_url: checkoutResult.checkoutUrl,
      stripe_session_id: checkoutResult.sessionId,
      autopilot_enabled,
      pause_auto_send,
      notes,
    });

    return NextResponse.json({ invoice: createdInvoice }, { status: 201 });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
