import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice_id, custom_fee_percent } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    const testPaymentId = `py_test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const result = await db.processInvoicePayment(invoice_id, testPaymentId, custom_fee_percent);

    return NextResponse.json({
      success: true,
      payment: result.payment,
      invoice: result.invoice,
    });
  } catch (error: any) {
    console.error('Simulate payout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
