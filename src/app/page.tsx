'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CreditCard,
  Mail,
  TrendingUp,
  Lock,
  Play,
  CheckCircle2,
  DollarSign,
  Layers,
  ChevronRight,
  Check,
  Bot,
  UserCheck,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-xl tracking-tighter">
              P
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Pay<span className="text-emerald-400">Loop</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Production Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition hidden sm:inline-block"
            >
              Sign In / Open App
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition transform active:scale-95"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated Recovery • Zero Upfront Cost • 5% Split Fee</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
          Recover late invoices on autopilot.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Split fees at the point of payment.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          PayLoop combines <strong>Gemini AI</strong> calibrated escalation notices, <strong>Stripe Connect Express</strong> instant destination split transfers, and strict debtor compliance guardrails. Zero awkward client conversations.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-95"
          >
            <span>Get Started & Open Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Connect Stripe & Add Invoices</span>
          </Link>
        </div>

        {/* Interactive Feature Architecture Showcase */}
        <div className="w-full max-w-5xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl text-left">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                End-to-End Autonomous Pipeline
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                How PayLoop Recovers $10,000s in Unpaid Freelance Fees
              </h3>
            </div>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <span>Explore Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            {/* Step 1 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="text-base font-bold text-white">Daily Cron Escalation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated scheduler evaluates days overdue (Stages 1–4) and detects when invoices cross recovery thresholds.
              </p>
              <div className="text-[11px] text-blue-400 font-medium">Stage 1 (1d) → Stage 4 (30d)</div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="text-base font-bold text-white">Gemini AI Drafting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI drafts stage-calibrated emails matching client tone with FDCPA consumer debt & B2B compliance guardrails.
              </p>
              <div className="text-[11px] text-cyan-400 font-medium">Review Queue for Stages 3 & 4</div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="text-base font-bold text-white">Stripe Instant Split</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When client pays, webhook automatically takes 5% platform fee and transfers 95% straight to freelancer Connect account.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium">Zero manual reconciliation</div>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-12 text-left">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h5 className="font-bold text-white text-sm mb-1">Strict Guardrails</h5>
            <p className="text-xs text-slate-400">
              Stages 3 & 4 firm notices are held for review unless explicit autopilot is toggled.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <Mail className="w-6 h-6 text-cyan-400 mb-3" />
            <h5 className="font-bold text-white text-sm mb-1">Open & Click Tracking</h5>
            <p className="text-xs text-slate-400">
              Built-in tracking pixels and Resend webhooks log when debtors view and click payments.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <CreditCard className="w-6 h-6 text-indigo-400 mb-3" />
            <h5 className="font-bold text-white text-sm mb-1">Stripe Connect Express</h5>
            <p className="text-xs text-slate-400">
              Direct destination transfers with 1099-K tax compliance and instant bank deposits.
            </p>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-purple-400 mb-3" />
            <h5 className="font-bold text-white text-sm mb-1">Live Recovery Analytics</h5>
            <p className="text-xs text-slate-400">
              Track money recovered ($), platform earnings ($), and stage conversion velocity.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} PayLoop. Built for Freelancers, Agencies & Solopreneurs.</p>
      </footer>
    </div>
  );
}
