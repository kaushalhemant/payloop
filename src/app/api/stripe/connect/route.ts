import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripeService } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const user = await db.getUser();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard?stripe_connected=true`;
    const refreshUrl = `${baseUrl}/dashboard?stripe_refresh=true`;

    const { accountId, onboardingUrl } = await stripeService.createConnectAccountLink(
      user.id,
      user.email,
      returnUrl,
      refreshUrl
    );

    await db.updateUser({
      stripe_connect_account_id: accountId,
      stripe_connect_status: 'active',
    });

    return NextResponse.json({
      success: true,
      accountId,
      onboardingUrl,
    });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await db.getUser();
    const accountId = user.stripe_connect_account_id;

    let dashboardUrl = null;
    if (accountId) {
      dashboardUrl = await stripeService.createLoginLink(accountId);
    }

    return NextResponse.json({
      connected: user.stripe_connect_status === 'active',
      accountId: user.stripe_connect_account_id,
      status: user.stripe_connect_status,
      feePercent: user.fee_percent,
      dashboardUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
