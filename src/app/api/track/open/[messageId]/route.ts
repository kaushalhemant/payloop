import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1x1 transparent GIF in Base64
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export async function GET(req: Request, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const { messageId } = await params;
    if (messageId) {
      const messages = await db.getMessages();
      const message = messages.find((m) => m.id === messageId);
      if (message && !message.opened_at) {
        await db.updateMessage(messageId, {
          opened_at: new Date().toISOString(),
          status: 'opened',
        });
      }
    }
  } catch (error) {
    console.error('Open tracking pixel error:', error);
  }

  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF_BUFFER.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
