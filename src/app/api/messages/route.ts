import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoiceId') || undefined;
    const messages = await db.getMessages(invoiceId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoice_id, stage = 1, channel = 'email', subject, content, status = 'draft', reviewed_by_user = false } = body;

    if (!invoice_id || !subject || !content) {
      return NextResponse.json({ error: 'invoice_id, subject, and content are required' }, { status: 400 });
    }

    const message = await db.createMessage({
      invoice_id,
      stage,
      channel,
      subject,
      content,
      status,
      reviewed_by_user,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
