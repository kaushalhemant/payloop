'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Sliders,
  CheckCircle,
  ExternalLink,
  Users,
  FileSpreadsheet,
  Building,
  Mail,
  User as UserIcon,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { User } from '@/types';

interface HeaderProps {
  user: User;
  onOpenNewInvoice: () => void;
  onOpenNewClient: () => void;
  onOpenBatchImport: () => void;
  onRunEscalation: () => void;
  onResetDatabase: (mode?: 'clean' | 'sample') => void;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
  escalationRunning: boolean;
}

export function Header({
  user,
  onOpenNewInvoice,
  onOpenNewClient,
  onOpenBatchImport,
  onRunEscalation,
  onResetDatabase,
  onUpdateUser,
  escalationRunning,
}: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [businessName, setBusinessName] = useState(user.business_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [stripeAccountId, setStripeAccountId] = useState(user.stripe_connect_account_id || '');
  const [feePercent, setFeePercent] = useState(user.fee_percent || 5);
  const [autopilot, setAutopilot] = useState(user.autopilot_enabled || false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setName(user.name || '');
    setBusinessName(user.business_name || '');
    setEmail(user.email || '');
    setStripeAccountId(user.stripe_connect_account_id || '');
    setFeePercent(user.fee_percent || 5);
    setAutopilot(user.autopilot_enabled || false);
  }, [user]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    await onUpdateUser({
      name,
      business_name: businessName,
      email,
      stripe_connect_account_id: stripeAccountId,
      stripe_connect_status: stripeAccountId ? 'active' : 'not_connected',
      fee_percent: feePercent,
      autopilot_enabled: autopilot,
    });
    setSavingSettings(false);
    setShowSettings(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-xl tracking-tighter">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">
                Pay<span className="text-emerald-400">Loop</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {user.business_name || 'Recovery Hub'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Autonomous Late-Invoice Recovery & Split Settlement
            </p>
          </div>
        </div>

        {/* Integration Status Badges */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Stripe Connect</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-medium">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Gemini AI</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-medium">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>Resend Tracking</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Daily Escalation Run Button */}
          <button
            onClick={onRunEscalation}
            disabled={escalationRunning}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            title="Scan all invoices and trigger stage escalation + AI messages"
          >
            {escalationRunning ? (
              <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            )}
            <span>Run Escalation</span>
          </button>

          {/* Quick Import CSV */}
          <button
            onClick={onOpenBatchImport}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
            title="Import invoices via CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* New Client */}
          <button
            onClick={onOpenNewClient}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">+ Client</span>
          </button>

          {/* New Invoice */}
          <button
            onClick={onOpenNewInvoice}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Invoice</span>
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs transition ${
              showSettings
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Workspace Profile & Recovery Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Drawer / Popover */}
      {showSettings && (
        <div className="border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 sm:px-8 py-6 shadow-2xl animate-fade-in">
          <form onSubmit={handleSaveSettings} className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Workspace Profile & Recovery Configuration
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business / Studio Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Morgan Creative & Tech"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Remittance Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. billing@yourstudio.dev"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Stripe Account & Split Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Stripe Connect Account ID
                </label>
                <input
                  type="text"
                  value={stripeAccountId}
                  onChange={(e) => setStripeAccountId(e.target.value)}
                  placeholder="e.g. acct_1N..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Fee Percent Slider */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="flex justify-between font-semibold mb-1 text-xs">
                  <span className="text-slate-400">Success Fee Cut:</span>
                  <span className="text-emerald-400 font-bold">{feePercent}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={feePercent}
                  onChange={(e) => setFeePercent(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1% Min</span>
                  <span>5% Standard</span>
                  <span>20% Max</span>
                </div>
              </div>

              {/* Global Autopilot Toggle */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Global Autopilot</div>
                  <div className="text-[10px] text-slate-500">Auto-send stage 3 & 4 notices</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutopilot(!autopilot)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    autopilot ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onResetDatabase('clean')}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl font-medium flex items-center gap-1.5 transition"
                  title="Clear all invoices and clients to start fresh"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Workspace Data</span>
                </button>

                <button
                  type="button"
                  onClick={() => onResetDatabase('sample')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium flex items-center gap-1.5 transition"
                  title="Load sample invoices and debtors for testing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Load Sample Demo Data</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                {savingSettings ? 'Saving Profile...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
