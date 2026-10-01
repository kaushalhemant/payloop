import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const clients = await db.getClients();
    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await db.getUser();
    const {
      name,
      email,
      phone = '',
      company = '',
      relationship_tone = 'friendly',
      debtor_type = 'business',
      compliance_disclaimer,
      autopilot_override = null,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const defaultDisclaimer =
      debtor_type === 'consumer'
        ? 'NOTICE: This is a communication regarding an outstanding consumer obligation. Under fair collection standards, you have the right to request debt verification within 30 days.'
        : 'Commercial debt governed under applicable B2B commercial agreement terms and late penalty clauses.';

    const client = await db.createClient({
      user_id: user.id,
      name,
      email,
      phone,
      company,
      relationship_tone,
      debtor_type,
      compliance_disclaimer: compliance_disclaimer || defaultDisclaimer,
      autopilot_override,
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
