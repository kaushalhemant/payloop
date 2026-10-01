import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripeService, stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: any;

    if (stripe && webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Parse JSON directly in test mode / simulation
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const invoiceId = session.metadata?.invoiceId || session.client_reference_id;
      const paymentIntentId = session.payment_intent || session.id;

      if (invoiceId) {
        const invoice = await db.getInvoiceById(invoiceId);
        if (invoice && invoice.status !== 'paid') {
          const user = await db.getUser();
          const feeRate = user.fee_percent / 100;
          const totalAmount = invoice.amount;
          const platformFee = Math.round(totalAmount * feeRate * 100) / 100;
          const freelancerPayout = Math.round((totalAmount - platformFee) * 100) / 100;

          let transferId = `tr_sim_${Math.random().toString(36).substr(2, 9)}`;

          // If Stripe connected account exists, execute instant transfer
          if (user.stripe_connect_account_id) {
            const transferResult = await stripeService.transferToConnectedAccount(
              freelancerPayout,
              user.stripe_connect_account_id,
              invoice.id
            );
            transferId = transferResult.transferId;
          }

          // Record payment
          await db.createPayment({
            invoice_id: invoice.id,
            amount_paid: totalAmount,
            platform_fee: platformFee,
            freelancer_payout: freelancerPayout,
            stripe_payment_id: paymentIntentId,
            stripe_transfer_id: transferId,
            stripe_connect_account_id: user.stripe_connect_account_id || 'acct_1PayLoopTestExpress99',
            status: 'completed',
          });

          // Mark invoice as paid
          await db.updateInvoice(invoice.id, {
            status: 'paid',
            paid_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
