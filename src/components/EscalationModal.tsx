'use client';

import React from 'react';
import { Play, X, CheckCircle2, AlertTriangle, Send, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { EscalationReport } from '@/lib/cron/escalate';

interface EscalationModalProps {
  isOpen: boolean;
  report: EscalationReport | null;
  onClose: () => void;
  onGoToReviewQueue: () => void;
}

export function EscalationModal({ isOpen, report, onClose, onGoToReviewQueue }: EscalationModalProps) {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Play className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Daily Escalation Job Complete</h3>
              <p className="text-xs text-slate-400">
                Executed on {new Date(report.timestamp).toLocaleTimeString()} • {report.invoicesChecked} Invoices Evaluated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Invoices Scanned</span>
            <div className="text-xl font-black text-white mt-0.5">{report.invoicesChecked}</div>
          </div>

          <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-400">Stages Advanced</span>
            <div className="text-xl font-black text-amber-300 mt-0.5">{report.stagesAdvanced}</div>
          </div>

          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-400">Auto-Dispatched</span>
            <div className="text-xl font-black text-emerald-300 mt-0.5">{report.messagesAutoSent}</div>
          </div>

          <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase text-rose-400">Queued for Review</span>
            <div className="text-xl font-black text-rose-300 mt-0.5">{report.messagesQueuedForReview}</div>
          </div>
        </div>

        {/* Execution Log Details */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Escalation Audit Log</h4>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-2.5 text-xs font-mono">
            {report.details.length === 0 ? (
              <p className="text-slate-500">All invoices are up-to-date. No overdue threshold crossings detected.</p>
            ) : (
              report.details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between pb-2 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div>
                    <span className="text-white font-bold">{item.invoiceNumber}</span>
                    <span className="text-slate-400 ml-2">({item.clientName})</span>
                    <span className="text-amber-400 ml-2 font-sans font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10">
                      Stage {item.stage} ({item.daysOverdue}d overdue)
                    </span>
                  </div>
                  <div>
                    {item.actionTaken === 'auto_sent' && (
                      <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched via Resend
                      </span>
                    )}
                    {item.actionTaken === 'queued_for_review' && (
                      <span className="text-orange-400 font-sans font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Placed in Review Queue
                      </span>
                    )}
                    {item.actionTaken === 'paused' && (
                      <span className="text-amber-400 font-sans font-bold">Auto-Send Paused</span>
                    )}
                    {item.actionTaken === 'already_sent' && (
                      <span className="text-slate-500 font-sans">Stage Notice Already Active</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Next automated run scheduled at midnight UTC (Vercel Cron)
          </div>

          <div className="flex items-center gap-3">
            {report.messagesQueuedForReview > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onGoToReviewQueue();
                }}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Go to Review Queue ({report.messagesQueuedForReview})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
