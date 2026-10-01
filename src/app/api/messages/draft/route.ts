import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { geminiService } from '@/lib/gemini';
import { MessageStage } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice_id, stage, custom_instructions } = body;

    if (!invoice_id) {
      return NextResponse.json({ error: 'invoice_id is required' }, { status: 400 });
    }

    const invoice = await db.getInvoiceById(invoice_id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const client = invoice.client || (await db.getClientById(invoice.client_id));
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const user = await db.getUser();
    const targetStage: MessageStage = (stage || invoice.current_stage || 1) as MessageStage;

    const draft = await geminiService.draftRecoveryEmail({
      invoice,
      client,
      freelancerName: user.name,
      freelancerBusiness: user.business_name,
      stage: targetStage,
      customInstructions: custom_instructions,
    });

    return NextResponse.json({ success: true, draft });
  } catch (error: any) {
    console.error('Gemini draft error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
