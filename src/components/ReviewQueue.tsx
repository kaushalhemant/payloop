'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Building2,
  Mail,
  User,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Message, Invoice, Client, STAGE_RULES, MessageStage } from '@/types';

interface ReviewQueueProps {
  messages: Message[];
  invoices: Invoice[];
  clients: Client[];
  onSendMessage: (messageId: string, editedSubject?: string, editedContent?: string) => Promise<void>;
  onRegenerateDraft: (invoiceId: string, stage: MessageStage, instructions?: string) => Promise<void>;
}

export function ReviewQueue({
  messages,
  invoices,
  clients,
  onSendMessage,
  onRegenerateDraft,
}: ReviewQueueProps) {
  const pendingMessages = messages.filter((m) => m.status === 'pending_review');

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    pendingMessages[0]?.id || null
  );
  const [editedSubject, setEditedSubject] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Sync editor when active message changes
  const activeMessage = messages.find((m) => m.id === selectedMessageId) || pendingMessages[0];
  const activeInvoice = activeMessage
    ? invoices.find((i) => i.id === activeMessage.invoice_id)
    : null;
  const activeClient = activeInvoice
    ? clients.find((c) => c.id === activeInvoice.client_id)
    : null;

  React.useEffect(() => {
    if (activeMessage) {
      setEditedSubject(activeMessage.subject);
      setEditedContent(activeMessage.content);
    }
  }, [activeMessage?.id]);

  const handleApproveAndSend = async () => {
    if (!activeMessage) return;
    setIsSending(true);
    await onSendMessage(activeMessage.id, editedSubject, editedContent);
    setIsSending(false);
  };

  const handleRegenerate = async () => {
    if (!activeInvoice || !activeMessage) return;
    setIsRegenerating(true);
    await onRegenerateDraft(activeInvoice.id, activeMessage.stage, customPrompt);
    setIsRegenerating(false);
    setCustomPrompt('');
  };

  if (pendingMessages.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center shadow-xl backdrop-blur-md">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Review Queue is Clear</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          All high-urgency Stage 3 & Stage 4 late notices have been reviewed and approved. When new invoices cross the 14-day or 30-day thresholds, they will appear here for your guardrail verification.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
        <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-300 mb-1">
            Guardrail Active: {pendingMessages.length} Notice{pendingMessages.length > 1 ? 's' : ''} Require Approval
          </h4>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            PayLoop never auto-dispatches firm or final legal demand notices (Stages 3 & 4) without your explicit review and sign-off, protecting your client relationships and ensuring debtor compliance.
          </p>
        </div>
      </div>

      {/* Main Review Workplace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Queue List */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Pending Approval ({pendingMessages.length})
          </h4>

          <div className="space-y-2">
            {pendingMessages.map((msg) => {
              const inv = invoices.find((i) => i.id === msg.invoice_id);
              const cl = inv ? clients.find((c) => c.id === inv.client_id) : null;
              const isSelected = msg.id === activeMessage?.id;
              const stageInfo = STAGE_RULES[msg.stage];

              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessageId(msg.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        msg.stage === 4
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                      }`}
                    >
                      Stage {msg.stage}: {stageInfo.name}
                    </span>
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      ${inv?.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="font-bold text-white text-xs truncate">
                    {cl?.name || 'Client'} {cl?.company ? `(${cl.company})` : ''}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {inv?.invoice_number} • {inv?.days_overdue} days overdue
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Editor & Dispatcher */}
        {activeMessage && activeInvoice && (
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
            {/* Header Details */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    Reviewing Stage {activeMessage.stage} Notice for {activeInvoice.invoice_number}
                  </span>
                  {activeClient?.debtor_type === 'consumer' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Consumer Debtor FDCPA
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>To: <strong className="text-slate-200">{activeClient?.email}</strong></span>
                  <span>•</span>
                  <span>Overdue: <strong className="text-rose-400">{activeInvoice.days_overdue} days</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                  Tone: <span className="text-emerald-400 capitalize">{activeClient?.relationship_tone || 'Professional'}</span>
                </span>
              </div>
            </div>

            {/* AI Prompt Customizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Gemini 2.5 Prompt Modifier
                </span>
                <span className="text-slate-500 text-[11px]">Refine tone or add settlement terms</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Offer a 5% discount if settled within 24h, or soften the opening tone..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {isRegenerating ? (
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Email Subject Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Email Content Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Message Content (Markdown Supported)</span>
                <span className="text-slate-500 text-[10px] font-normal">[STRIPE_CHECKOUT_URL] is auto-replaced</span>
              </label>
              <textarea
                rows={10}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Compliance Disclaimer Notice */}
            {activeClient?.debtor_type === 'consumer' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-300">Consumer Compliance Attached:</strong> Fair debt collection notice and 30-day verification disclaimer are embedded in the footer.
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Direct Stripe Payment Link: <span className="text-emerald-400 font-mono">/pay/{activeInvoice.id}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApproveAndSend}
                  disabled={isSending}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Sending via Resend...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Approve & Dispatch Notice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
