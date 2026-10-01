'use client';

import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  ShieldAlert,
  Percent,
  ArrowUpRight,
  Zap,
  Sparkles,
  Award,
} from 'lucide-react';
import { Invoice, Payment, Message } from '@/types';

interface MetricCardsProps {
  invoices: Invoice[];
  payments: Payment[];
  messages: Message[];
  onSelectTab: (tab: string) => void;
}

export function MetricCards({ invoices, payments, messages, onSelectTab }: MetricCardsProps) {
  // Calculations
  const totalRecovered = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const totalPlatformFees = payments.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
  const totalFreelancerPayouts = payments.reduce((sum, p) => sum + (p.freelancer_payout || 0), 0);

  const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue');
  const totalOverdueAtRisk = overdueInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const pendingReviewCount = messages.filter((m) => m.status === 'pending_review').length;
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const totalCount = invoices.length;
  const recoveryRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Recovered */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:border-emerald-500/50 transition">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Total Recovered
          </span>
          <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {formatCurrency(totalRecovered)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>{paidCount} invoices resolved</span>
          <span className="text-emerald-400 font-semibold flex items-center">
            {recoveryRate}% Rate <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* 2. PayLoop Earnings (Fees Collected) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:border-cyan-500/50 transition">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Platform Earnings
          </span>
          <span className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Percent className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {formatCurrency(totalPlatformFees)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>Success fee split</span>
          <span className="text-cyan-400 font-semibold">Instant transfer</span>
        </div>
      </div>

      {/* 3. Freelancer Net Payouts */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:border-indigo-500/50 transition">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Net Stripe Payouts
          </span>
          <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Award className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {formatCurrency(totalFreelancerPayouts)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>Sent to Connected Acct</span>
          <span className="text-indigo-400 font-semibold">100% Verified</span>
        </div>
      </div>

      {/* 4. Overdue at Risk & Review Queue */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-rose-500/30 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:border-rose-500/50 transition">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Overdue at Risk
          </span>
          <span className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {formatCurrency(totalOverdueAtRisk)}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>{overdueInvoices.length} active escalations</span>
          {pendingReviewCount > 0 ? (
            <button
              onClick={() => onSelectTab('review')}
              className="text-amber-400 font-bold hover:underline flex items-center gap-1 animate-pulse"
            >
              {pendingReviewCount} in Review Queue →
            </button>
          ) : (
            <span className="text-slate-500">All reviewed</span>
          )}
        </div>
      </div>
    </div>
  );
}
