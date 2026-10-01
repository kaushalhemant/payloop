'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, RotateCcw, ShieldAlert, Check, Copy, AlertCircle } from 'lucide-react';
import { Invoice, MessageStage, STAGE_RULES } from '@/types';

interface AiDraftModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSendDraft: (draftData: { invoice_id: string; stage: MessageStage; subject: string; content: string }) => Promise<void>;
}

export function AiDraftModal({ isOpen, invoice, onClose, onSendDraft }: AiDraftModalProps) {
  const [selectedStage, setSelectedStage] = useState<MessageStage>(1);
  const [customPrompt, setCustomPrompt] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (invoice) {
      setSelectedStage((invoice.current_stage || 1) as MessageStage);
      generateAiDraft((invoice.current_stage || 1) as MessageStage);
    }
  }, [invoice?.id]);

  if (!isOpen || !invoice) return null;

  const generateAiDraft = async (stage: MessageStage, instructions?: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/messages/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
          stage,
          custom_instructions: instructions || customPrompt,
        }),
      });

      const data = await res.json();
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setContent(data.draft.content);
      }
    } catch (err) {
      console.error('Failed to generate draft:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendOrQueue = async () => {
    setSending(true);
    try {
      await onSendDraft({
        invoice_id: invoice.id,
        stage: selectedStage,
        subject,
        content,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const stageRule = STAGE_RULES[selectedStage];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Gemini 2.5 Recovery Studio</h3>
              <p className="text-xs text-slate-400">
                Drafting for <strong className="text-slate-200">{invoice.invoice_number}</strong> • {invoice.client?.name}
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

        {/* Stage Selector Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Escalation Stage & Tone</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([1, 2, 3, 4] as MessageStage[]).map((stg) => {
              const info = STAGE_RULES[stg];
              const isSelected = selectedStage === stg;
              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => {
                    setSelectedStage(stg);
                    generateAiDraft(stg);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Stage {stg}</span>
                    {info.requires_review && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Requires Review" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">{info.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Prompt Instructions */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Custom Guidance for Gemini</span>
            <span className="text-[10px] text-slate-500">Optional</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Include 5% settlement discount if paid today, or mention upcoming tax deadline..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => generateAiDraft(selectedStage, customPrompt)}
              disabled={generating}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {generating ? (
                <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Subject & Body Output */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
              <span>Message Body</span>
              {generating && <span className="text-cyan-400 text-xs animate-pulse">Drafting with Gemini...</span>}
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Guardrail Alert for Stages 3 & 4 */}
        {selectedStage >= 3 && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Guardrail Protected:</strong> Stage {selectedStage} is a formal escalation. If not sent immediately, it will be safely placed in your Review Queue.
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`Subject: ${subject}\n\n${content}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendOrQueue}
              disabled={sending || generating}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {sending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Notice via Resend</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
