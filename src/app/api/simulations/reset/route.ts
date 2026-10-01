import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    let mode: 'clean' | 'sample' = 'clean';
    try {
      const body = await req.json();
      if (body?.mode === 'sample') mode = 'sample';
    } catch {
      // Body empty or not JSON, default to clean
    }

    await db.resetDatabase(mode);
    return NextResponse.json({
      success: true,
      mode,
      message: mode === 'sample' ? 'Sample template data loaded.' : 'Workspace cleared cleanly.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
