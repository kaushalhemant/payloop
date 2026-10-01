import { NextResponse } from 'next/server';
import { runEscalationJob } from '@/lib/cron/escalate';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const referenceDate = body.referenceDate ? new Date(body.referenceDate) : new Date();

    const report = await runEscalationJob(referenceDate);
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Escalation cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const report = await runEscalationJob(new Date());
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Escalation cron GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
