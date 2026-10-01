'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Copy,
  Check,
  Sparkles,
  Play,
  Pause,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  Trash2,
  Send,
  CreditCard,
  Eye,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  FileSpreadsheet,
  Receipt,
} from 'lucide-react';
import { Invoice, STAGE_RULES, MessageStage } from '@/types';

interface InvoiceTableProps {
  invoices: Invoice[];
  onDraftAiMessage: (invoice: Invoice) => void;
  onReviewMessage: (invoice: Invoice) => void;
  onSimulatePayment: (invoice: Invoice) => void;
  onToggleAutopilot: (invoice: Invoice) => void;
  onTogglePause: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onViewDetails: (invoice: Invoice) => void;
  onOpenNewInvoice?: () => void;
  onOpenBatchImport?: () => void;
}

export function InvoiceTable({
  invoices,
  onDraftAiMessage,
  onReviewMessage,
  onSimulatePayment,
  onToggleAutopilot,
  onTogglePause,
  onDeleteInvoice,
  onViewDetails,
  onOpenNewInvoice,
  onOpenBatchImport,
}: InvoiceTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'paid' | 'stage1' | 'stage2' | 'stage3' | 'stage4'>('all');
  const [sortBy, setSortBy] = useState<'days_overdue' | 'amount' | 'due_date'>('days_overdue');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = invoice.stripe_checkout_url?.startsWith('http')
      ? invoice.stripe_checkout_url
      : `${window.location.origin}${invoice.stripe_checkout_url || `/pay/${invoice.id}`}`;

    navigator.clipboard.writeText(url);
    setCopiedId(invoice.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'overdue') return inv.status === 'overdue';
    if (statusFilter === 'paid') return inv.status === 'paid';
    if (statusFilter === 'stage1') return inv.status === 'overdue' && inv.current_stage === 1;
    if (statusFilter === 'stage2') return inv.status === 'overdue' && inv.current_stage === 2;
    if (statusFilter === 'stage3') return inv.status === 'overdue' && inv.current_stage === 3;
    if (statusFilter === 'stage4') return inv.status === 'overdue' && inv.current_stage === 4;

    return true;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === 'days_overdue') {
      return (b.days_overdue || 0) - (a.days_overdue || 0);
    }
    if (sortBy === 'amount') {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === 'due_date') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return 0;
  });

  const getStageBadge = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
        </span>
      );
    }

    const stage = invoice.current_stage || 1;
    const stageInfo = STAGE_RULES[stage as MessageStage];

    if (stage === 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" /> Stage 4: Final Demand
        </span>
      );
    }
    if (stage === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
          <AlertTriangle className="w-3.5 h-3.5" /> Stage 3: Firm Notice
        </span>
      );
    }
    if (stage === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" /> Stage 2: Follow-Up
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
        <Clock className="w-3.5 h-3.5" /> Stage 1: Gentle Reminder
      </span>
    );
  };

  // If entire invoice list is empty
  if (invoices.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 sm:p-14 text-center shadow-xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Invoices in Workspace</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
          Add your overdue or upcoming invoices to initiate autonomous recovery tracking, AI escalation emails, and Stripe split settlements.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenNewInvoice && (
            <button
              onClick={onOpenNewInvoice}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create First Invoice</span>
            </button>
          )}

          {onOpenBatchImport && (
            <button
              onClick={onOpenBatchImport}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Import from CSV</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by invoice #, client, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'overdue' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overdue ({invoices.filter((i) => i.status === 'overdue').length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paid ({invoices.filter((i) => i.status === 'paid').length})
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="days_overdue">Sort: Urgency / Days Overdue</option>
            <option value="amount">Sort: Highest Amount</option>
            <option value="due_date">Sort: Due Date</option>
          </select>
        </div>
      </div>

      {/* Invoices List / Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-6">Invoice & Client</th>
              <th className="py-4 px-4">Amount</th>
              <th className="py-4 px-4">Overdue / Due Date</th>
              <th className="py-4 px-4">Recovery Stage</th>
              <th className="py-4 px-4">Autopilot</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {sortedInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  No invoices match your search or filter criteria.
                </td>
              </tr>
            ) : (
              sortedInvoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isFirmStage = inv.current_stage >= 3;
                const formattedAmt = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: inv.currency || 'USD',
                }).format(inv.amount);

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onViewDetails(inv)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    {/* Invoice & Client */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isFirmStage
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {inv.invoice_number.includes('-') ? inv.invoice_number.split('-')[1] : '#' + inv.invoice_number.slice(-3)}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{inv.invoice_number}</span>
                            {inv.client?.debtor_type === 'consumer' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                                Consumer Debtor
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                                B2B
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5 truncate max-w-xs">
                            {inv.client?.name || 'Unassigned'} {inv.client?.company ? `• ${inv.client.company}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-bold text-slate-100 text-sm">
                      {formattedAmt}
                    </td>

                    {/* Overdue / Due Date */}
                    <td className="py-4 px-4">
                      {isPaid ? (
                        <span className="text-slate-400 text-[11px]">
                          Paid on {new Date(inv.paid_at || '').toLocaleDateString()}
                        </span>
                      ) : (
                        <div>
                          <div
                            className={`font-semibold ${
                              inv.days_overdue >= 14
                                ? 'text-rose-400'
                                : inv.days_overdue > 0
                                ? 'text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {inv.days_overdue > 0 ? `${inv.days_overdue} days overdue` : 'Due soon'}
                          </div>
                          <div className="text-[11px] text-slate-500">Due {inv.due_date}</div>
                        </div>
                      )}
                    </td>

                    {/* Stage Badge */}
                    <td className="py-4 px-4">{getStageBadge(inv)}</td>

                    {/* Autopilot & Pause */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleAutopilot(inv)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                            inv.autopilot_enabled
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title="When enabled, stages 3 & 4 will auto-send without review"
                        >
                          {inv.autopilot_enabled ? 'Autopilot ON' : 'Autopilot OFF'}
                        </button>

                        <button
                          type="button"
                          onClick={() => onTogglePause(inv)}
                          className={`p-1.5 rounded-lg border text-xs transition ${
                            inv.pause_auto_send
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title={inv.pause_auto_send ? 'Auto-send is PAUSED' : 'Auto-send is active'}
                        >
                          {inv.pause_auto_send ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Checkout Link */}
                        <button
                          onClick={(e) => handleCopyLink(inv, e)}
                          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition"
                          title="Copy Stripe Checkout Link"
                        >
                          {copiedId === inv.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Draft AI Message */}
                        <button
                          onClick={() => onDraftAiMessage(inv)}
                          className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 transition"
                          title="Draft Gemini Recovery Email"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Review / Send or Simulate Pay */}
                        {!isPaid ? (
                          <>
                            {isFirmStage && (
                              <button
                                onClick={() => onReviewMessage(inv)}
                                className="px-2.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 rounded-xl text-orange-300 text-[11px] font-bold flex items-center gap-1 transition"
                                title="Review firm notice before sending"
                              >
                                <Send className="w-3 h-3" /> Review
                              </button>
                            )}
                            <button
                              onClick={() => onSimulatePayment(inv)}
                              className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition"
                              title="Simulate Stripe Payment & Instant Fee Split"
                            >
                              <CreditCard className="w-3 h-3" /> Pay Split
                            </button>
                          </>
                        ) : (
                          <a
                            href={inv.stripe_checkout_url || `/pay/${inv.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition"
                            title="View Settled Receipt"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-2 bg-slate-950 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 rounded-xl text-slate-500 hover:text-rose-300 transition"
                          title="Delete invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
