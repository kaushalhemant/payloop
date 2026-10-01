'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Receipt,
  Download,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice, Client, Payment } from '@/types';

function PayInvoiceContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = params?.invoiceId as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<Payment | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'apple' | 'ach'>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    async function loadInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data.invoice);
          setClient(data.invoice?.client || null);
          if (data.invoice?.status === 'paid') {
            setPaidSuccess(true);
          }
        }
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    }

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setProcessing(true);

    try {
      const res = await fetch('/api/stripe/simulate-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaidSuccess(true);
        setPaymentRecord(data.payment);
        setInvoice(data.invoice);

        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10B981', '#06B6D4', '#6366F1', '#F59E0B'],
          });
        } catch {}
      } else {
        alert(data.error || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading secure invoice portal...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <p className="text-slate-400 text-sm mb-6">
            The requested invoice link may be invalid, expired, or has already been settled.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: invoice.currency || 'USD',
  }).format(invoice.amount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-lg">
              P
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Pay<span className="text-emerald-400">Loop</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Secure Escrow & Settlement
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit Encrypted Settlement</span>
          </div>
        </div>
      </header>

      {/* Main Payment Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex-1">
        {paidSuccess ? (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl animate-fade-in">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              Payment Completed & Settled
            </span>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              {formattedAmount} Paid Successfully
            </h1>

            <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base mb-8">
              Thank you! Your payment for <strong className="text-white">{invoice.invoice_number}</strong> has been verified. The funds and settlement fees have been allocated instantly via Stripe Connect.
            </p>

            {/* Receipt Summary Card */}
            <div className="max-w-md mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-left mb-8 shadow-inner">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Receipt Reference</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {paymentRecord?.stripe_payment_id || `py_${invoice.id}`}
                </span>
              </div>
              <div className="py-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Invoice:</span>
                  <span className="text-slate-200 font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client / Debtor:</span>
                  <span className="text-slate-200 font-medium">{client?.name || 'Authorized Client'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paid Amount:</span>
                  <span className="text-emerald-400 font-bold">{formattedAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settled At:</span>
                  <span className="text-slate-200">{new Date(invoice.paid_at || new Date()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement Method:</span>
                  <span className="text-slate-200">Stripe Instant Payout</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 font-medium text-sm flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Print / Save Receipt
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition"
              >
                Open PayLoop Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Invoice Details & Compliance */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Invoice</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {invoice.days_overdue > 0 ? `${invoice.days_overdue} Days Overdue` : 'Due for Payment'}
                  </span>
                </div>

                <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                  {formattedAmount}
                </h2>
                <p className="text-sm font-medium text-slate-400 mb-6">
                  {invoice.invoice_number} • {invoice.description}
                </p>

                <div className="space-y-4 pt-4 border-t border-slate-800 text-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-500" /> Billed To:
                    </span>
                    <span className="text-right text-slate-200 font-medium">
                      {client?.name}
                      {client?.company && <span className="block text-xs text-slate-400">{client.company}</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" /> Issue Date:
                    </span>
                    <span className="text-slate-200 font-medium">{invoice.issue_date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" /> Due Date:
                    </span>
                    <span className="text-rose-400 font-semibold">{invoice.due_date}</span>
                  </div>
                </div>
              </div>

              {/* Debtor Compliance Box */}
              {client?.debtor_type === 'consumer' ? (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-xs text-amber-300/90 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold mb-1 text-amber-400">
                    <ShieldCheck className="w-4 h-4" /> Consumer Rights Notice
                  </div>
                  {client.compliance_disclaimer ||
                    'This is a communication regarding an outstanding consumer obligation. Under fair collection standards, you have the right to request debt verification.'}
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 leading-relaxed">
                  <div className="flex items-center gap-2 font-semibold mb-1 text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Commercial Account Notice
                  </div>
                  Standard B2B commercial terms apply. Upon payment, an automated invoice clearance certificate and receipt will be dispatched immediately.
                </div>
              )}
            </div>

            {/* Right Column: Interactive Payment Portal */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Select Payment Method
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  Funds are settled directly through Stripe Connect. Zero hidden processing fees.
                </p>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3.5 rounded-2xl border text-center font-medium text-xs transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'card'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('apple')}
                    className={`p-3.5 rounded-2xl border text-center font-medium text-xs transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'apple'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Apple / Google Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('ach')}
                    className={`p-3.5 rounded-2xl border text-center font-medium text-xs transition flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'ach'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Bank ACH</span>
                  </button>
                </div>

                {/* Card Payment Form */}
                <form onSubmit={handlePayNow} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Vance"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4242 •••• •••• 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        required
                      />
                      <CreditCard className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expiration Date</label>
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Security Code (CVC)</label>
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition transform active:scale-[0.99] disabled:opacity-50"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                          <span>Authorizing via Stripe Connect...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay {formattedAmount} Now</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      Powered by Stripe Connect. Payout split calculated instantaneously.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} PayLoop Inc. Automated Late-Invoice Recovery & Settlement Protocol.</p>
      </footer>
    </div>
  );
}

export default function PayInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading payment portal...</p>
          </div>
        </div>
      }
    >
      <PayInvoiceContent />
    </Suspense>
  );
}
