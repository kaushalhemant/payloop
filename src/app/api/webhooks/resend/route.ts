import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.type; // e.g. 'email.opened', 'email.clicked', 'email.delivered', 'email.bounced'
    const emailId = payload.data?.email_id;

    if (!emailId) {
      return NextResponse.json({ received: true });
    }

    const messages = await db.getMessages();
    const message = messages.find((m) => m.resend_email_id === emailId);

    if (message) {
      if (eventType === 'email.opened' && !message.opened_at) {
        await db.updateMessage(message.id, {
          opened_at: new Date().toISOString(),
          status: 'opened',
        });
      } else if (eventType === 'email.clicked') {
        await db.updateMessage(message.id, {
          clicked_at: new Date().toISOString(),
          opened_at: message.opened_at || new Date().toISOString(),
          status: 'clicked',
        });
      } else if (eventType === 'email.delivered' && message.status === 'sent') {
        await db.updateMessage(message.id, {
          status: 'delivered',
        });
      }
    }

    return NextResponse.json({ success: true, event: eventType });
  } catch (error: any) {
    console.error('Resend webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
