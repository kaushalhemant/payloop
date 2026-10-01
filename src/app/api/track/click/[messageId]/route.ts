import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const { searchParams } = new URL(req.url);
  const redirectTarget = searchParams.get('redirect') || '/';

  try {
    if (messageId) {
      const messages = await db.getMessages();
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        await db.updateMessage(messageId, {
          clicked_at: new Date().toISOString(),
          opened_at: message.opened_at || new Date().toISOString(),
          status: 'clicked',
        });
      }
    }
  } catch (error) {
    console.error('Click tracking error:', error);
  }

  // Construct absolute URL for NextResponse.redirect
  const destination = redirectTarget.startsWith('http')
    ? new URL(redirectTarget)
    : new URL(redirectTarget, req.url);

  return NextResponse.redirect(destination, { status: 302 });
}
