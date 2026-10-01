'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  Eye,
  MousePointerClick,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Message, Invoice, Client, STAGE_RULES } from '@/types';

interface MessageTimelineProps {
  messages: Message[];
  invoices: Invoice[];
  clients: Client[];
  onSimulateOpen: (messageId: string) => Promise<void>;
  onSimulateClick: (messageId: string) => Promise<void>;
}

export function MessageTimeline({
  messages,
  invoices,
  clients,
  onSimulateOpen,
  onSimulateClick,
}: MessageTimelineProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const getStatusBadge = (msg: Message) => {
    if (msg.clicked_at || msg.status === 'clicked') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <MousePointerClick className="w-3 h-3" /> Checkout Clicked
        </span>
      );
    }
    if (msg.opened_at || msg.status === 'opened') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Eye className="w-3 h-3" /> Opened by Client
        </span>
      );
    }
    if (msg.status === 'sent' || msg.sent_at) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Send className="w-3 h-3" /> Delivered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Communication & Resend Tracking Timeline ({messages.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of AI-drafted notices, open events, click engagement, and recovery links
          </p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No message history recorded yet. Run the daily escalation job to generate recovery notices!
            </div>
          ) : (
            messages.map((msg) => {
              const inv = invoices.find((i) => i.id === msg.invoice_id);
              const cl = inv ? clients.find((c) => c.id === inv.client_id) : null;
              const stageInfo = STAGE_RULES[msg.stage];

              return (
                <div
                  key={msg.id}
                  className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs mt-0.5 ${
                        msg.stage === 4
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : msg.stage === 3
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : msg.stage === 2
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      S{msg.stage}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{msg.subject}</span>
                        {getStatusBadge(msg)}
                      </div>

                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>Invoice: <strong className="text-slate-200">{inv?.invoice_number}</strong> (${inv?.amount.toLocaleString()})</span>
                        <span>•</span>
                        <span>Client: <strong className="text-slate-200">{cl?.name}</strong></span>
                        {msg.sent_at && (
                          <>
                            <span>•</span>
                            <span>Sent: {new Date(msg.sent_at).toLocaleDateString()} {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </>
                        )}
                        {msg.opened_at && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">Opened: {new Date(msg.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Simulation triggers */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium transition"
                    >
                      Preview Email
                    </button>

                    {msg.status !== 'pending_review' && (
                      <>
                        {!msg.opened_at && (
                          <button
                            onClick={() => onSimulateOpen(msg.id)}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-semibold transition"
                            title="Simulate client opening email (pixel hit)"
                          >
                            Simulate Open
                          </button>
                        )}

                        {!msg.clicked_at && (
                          <button
                            onClick={() => onSimulateClick(msg.id)}
                            className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-[11px] font-semibold transition"
                            title="Simulate client clicking checkout link"
                          >
                            Simulate Click
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message Preview Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Email Dispatch Preview (Stage {selectedMessage.stage})
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedMessage.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {selectedMessage.content}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
