import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const isStripeConfigured = () => {
  return Boolean(stripeSecretKey && !stripeSecretKey.includes('placeholder') && stripeSecretKey.startsWith('sk_'));
};

export const stripe = isStripeConfigured()
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  : null;

export interface CreateCheckoutParams {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  clientEmail?: string;
  clientName?: string;
  successUrl: string;
  cancelUrl: string;
}

export const stripeService = {
  // 1. Create Connect Account Link for Freelancer Onboarding
  createConnectAccountLink: async (
    userId: string,
    email: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<{ accountId: string; onboardingUrl: string }> => {
    if (!stripe) {
      // Return simulated test mode onboarding link
      const mockAccountId = `acct_test_${Date.now()}`;
      return {
        accountId: mockAccountId,
        onboardingUrl: `${returnUrl}?connect_status=active&account_id=${mockAccountId}&simulated=true`,
      };
    }

    // Real Stripe Connect creation
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: { userId },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  },

  // 2. Create Stripe Checkout Session for Invoice
  createInvoiceCheckoutSession: async (params: CreateCheckoutParams): Promise<{ sessionId: string; checkoutUrl: string }> => {
    const { invoiceId, invoiceNumber, amount, currency = 'usd', clientEmail, successUrl, cancelUrl } = params;

    if (!stripe) {
      return {
        sessionId: `cs_test_mock_${invoiceId}`,
        checkoutUrl: `/pay/${invoiceId}?simulated=true`,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: `Payment for overdue invoice ${invoiceNumber} via PayLoop Recovery`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: clientEmail,
      metadata: {
        invoiceId,
        invoiceNumber,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url || `/pay/${invoiceId}`,
    };
  },

  // 3. Process Instant Transfer / Payout Split via Stripe Connect
  transferToConnectedAccount: async (
    amount: number,
    destinationAccountId: string,
    invoiceId: string
  ): Promise<{ transferId: string; success: boolean }> => {
    if (!stripe) {
      return {
        transferId: `tr_test_${Math.random().toString(36).substr(2, 9)}`,
        success: true,
      };
    }

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        destination: destinationAccountId,
        metadata: { invoiceId, source: 'payloop_recovery_split' },
      });
      return { transferId: transfer.id, success: true };
    } catch (error) {
      console.error('Stripe transfer error:', error);
      return {
        transferId: `tr_fallback_${Date.now()}`,
        success: false,
      };
    }
  },

  // 4. Create Express Dashboard Login Link
  createLoginLink: async (accountId: string): Promise<string> => {
    if (!stripe) {
      return 'https://dashboard.stripe.com/test/connect-accounts';
    }
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  },
};
