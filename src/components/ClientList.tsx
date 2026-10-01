'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Sparkles,
  Sliders,
  Trash2,
  Edit2,
  DollarSign,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { Client, Invoice } from '@/types';

interface ClientListProps {
  clients: Client[];
  invoices: Invoice[];
  onOpenNewClient: () => void;
  onUpdateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

export function ClientList({
  clients,
  invoices,
  onOpenNewClient,
  onUpdateClient,
  onDeleteClient,
}: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Client Relationship & Compliance Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure tone of voice, debtor classification, and autopilot overrides per client
            </p>
          </div>

          <button
            onClick={onOpenNewClient}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Client</span>
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 sm:p-14 text-center shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Clients Added Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
            Add your clients to calibrate AI relationship tone (Friendly, Professional, Firm), assign debtor classifications, and configure automated recovery policies.
          </p>

          <button
            onClick={onOpenNewClient}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Your First Client</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Client Relationship & Compliance Directory ({clients.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure tone of voice, debtor classification, and autopilot overrides per client
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => {
          const clientInvoices = invoices.filter((i) => i.client_id === client.id);
          const overdueInvoices = clientInvoices.filter((i) => i.status === 'overdue');
          const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
          const isConsumer = client.debtor_type === 'consumer';

          return (
            <div
              key={client.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4 hover:border-slate-700 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{client.name}</span>
                      {isConsumer ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Consumer Debtor
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          B2B Commercial
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">{client.company || 'Direct Client'}</p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteClient(client.id)}
                  className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                  title="Delete client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="text-xs text-slate-300 space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-300">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {/* Invoices & Overdue Balance */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Invoices:</span>
                  <span className="ml-1.5 font-bold text-white">{clientInvoices.length}</span>
                </div>
                <div>
                  <span className="text-slate-400">Overdue Balance:</span>
                  <span
                    className={`ml-1.5 font-bold font-mono ${
                      totalOverdue > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    ${totalOverdue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Relationship Tone Selector */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">AI Tone:</span>
                  <select
                    value={client.relationship_tone}
                    onChange={(e: any) => onUpdateClient(client.id, { relationship_tone: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-emerald-400 font-medium rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="friendly">Friendly & Warm</option>
                    <option value="neutral">Neutral & Professional</option>
                    <option value="firm">Firm & Assertive</option>
                  </select>
                </div>

                {/* Autopilot Override */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Autopilot:</span>
                  <select
                    value={client.autopilot_override === null || client.autopilot_override === undefined ? 'default' : client.autopilot_override ? 'true' : 'false'}
                    onChange={(e) => {
                      const val = e.target.value === 'default' ? null : e.target.value === 'true';
                      onUpdateClient(client.id, { autopilot_override: val });
                    }}
                    className="bg-slate-950 border border-slate-800 text-slate-300 font-medium rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="default">Use Global Setting</option>
                    <option value="true">Force Autopilot ON</option>
                    <option value="false">Force Review Required</option>
                  </select>
                </div>
              </div>

              {/* Compliance Disclaimer Preview */}
              {client.compliance_disclaimer && (
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Disclaimer:</strong> {client.compliance_disclaimer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
