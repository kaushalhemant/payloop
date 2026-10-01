'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  Sparkles,
  Building,
  AlertCircle,
} from 'lucide-react';
import { User, Payment, Invoice } from '@/types';

interface StripeConnectTabProps {
  user: User;
  payments: Payment[];
  invoices: Invoice[];
  onConnectStripe: () => Promise<void>;
}

export function StripeConnectTab({ user, payments, invoices, onConnectStripe }: StripeConnectTabProps) {
  const [calcAmount, setCalcAmount] = useState<number>(2500);
  const [isConnecting, setIsConnecting] = useState(false);

  const feeRate = (user.fee_percent || 5) / 100;
  const platformFee = Math.round(calcAmount * feeRate * 100) / 100;
  const freelancerPayout = Math.round((calcAmount - platformFee) * 100) / 100;

  const isConnected = Boolean(
    user.stripe_connect_status === 'active' || user.stripe_connect_account_id
  );

  const handleConnect = async () => {
    setIsConnecting(true);
    await onConnectStripe();
    setIsConnecting(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Connected Account Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
                <CreditCard className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white tracking-tight">Stripe Connect Express</h3>
                  {isConnected ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Payout Destination Ready
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Setup Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Account ID:{' '}
                  <strong className="text-slate-200">
                    {user.stripe_connect_account_id || 'Not Connected (Direct Settlement fallback enabled)'}
                  </strong>
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed pt-1">
              Your Stripe Express destination account receives instant split payouts the moment an overdue debtor settles their invoice. Platform success fees ({user.fee_percent || 5}%) are calculated and deducted automatically at point of payment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  <span>{isConnected ? 'Stripe Express Portal' : 'Connect Stripe Account'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Split Mechanism Interactive Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Interactive Split Fee Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Simulate how any invoice settlement splits between the platform cut and your account
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-300">Recovered Invoice Amount:</span>
                <span className="text-xl font-black text-white font-mono">${calcAmount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="200"
                max="15000"
                step="100"
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>$200</span>
                <span>$5,000</span>
                <span>$15,000</span>
              </div>
            </div>

            {/* Split Visual Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase text-emerald-400">
                  Freelancer Instant Payout ({100 - (user.fee_percent || 5)}%)
                </span>
                <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
                  ${freelancerPayout.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Deposited straight to your bank</span>
              </div>

              <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase text-cyan-400">
                  Platform Fee Cut ({user.fee_percent || 5}%)
                </span>
                <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
                  ${platformFee.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Only charged on successful recovery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Notes */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Stripe Destination Transfers Guarantee
            </h3>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>No Upfront Fees:</strong> PayLoop only takes its {user.fee_percent || 5}% success cut when money is recovered. Uncollected invoices cost zero dollars.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>Destination Transfers:</strong> Checkout payments are atomically split via Stripe Connect API transfers with immutable webhook verification.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>Automated Tax & 1099-K:</strong> Stripe handles all tax reporting and direct deposits to your local bank account worldwide.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-400 mt-4 flex items-center justify-between">
            <span>Webhook Destination:</span>
            <span className="font-mono text-emerald-400 text-xs">/api/stripe/webhook</span>
          </div>
        </div>
      </div>

      {/* Payment Settlement History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          Live Payout & Settlement Ledger ({payments.length})
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Real-time record of recovered invoice funds, fee splits, and Stripe transfer confirmation IDs
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Gross Collected</th>
                <th className="py-3 px-4">Fee Cut</th>
                <th className="py-3 px-4">Your Net Payout</th>
                <th className="py-3 px-4">Stripe Transfer ID</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No payments processed yet. When overdue clients pay their invoice checkout links, settled payout splits will be recorded here in real time.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const inv = invoices.find((i) => i.id === p.invoice_id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(p.created_at).toLocaleDateString()} {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {inv?.invoice_number || p.invoice_id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                        ${p.amount_paid.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300">
                        -${p.platform_fee.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-white font-mono">
                        ${p.freelancer_payout.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {p.stripe_transfer_id || 'tr_auto_split'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
