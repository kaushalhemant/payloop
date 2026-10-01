'use client';

import React, { useState } from 'react';
import { Users, X, ShieldCheck, Mail, Building2, Phone } from 'lucide-react';
import { RelationshipTone, DebtorType } from '@/types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClient: (clientData: any) => Promise<void>;
}

export function NewClientModal({ isOpen, onClose, onCreateClient }: NewClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [relationshipTone, setRelationshipTone] = useState<RelationshipTone>('friendly');
  const [debtorType, setDebtorType] = useState<DebtorType>('business');
  const [disclaimer, setDisclaimer] = useState(
    'Commercial debt governed under standard B2B net-30 terms and late penalty clauses.'
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDebtorTypeChange = (type: DebtorType) => {
    setDebtorType(type);
    if (type === 'consumer') {
      setDisclaimer(
        'NOTICE: This is a communication concerning an outstanding consumer obligation. Under fair collection standards, you have the right to request debt verification within 30 days.'
      );
    } else {
      setDisclaimer(
        'Commercial debt governed under standard B2B net-30 terms and late penalty clauses.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Name and Email are required.');
      return;
    }

    setLoading(true);
    try {
      await onCreateClient({
        name,
        email,
        phone,
        company,
        relationship_tone: relationshipTone,
        debtor_type: debtorType,
        compliance_disclaimer: disclaimer,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error creating client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add New Client</h3>
              <p className="text-xs text-slate-400">Configure client profile, relationship tone & legal disclaimer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@clientcorp.com"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company / Business</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Miller & Partners LLC"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Debtor Type & Relationship Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Debtor Classification *</label>
              <select
                value={debtorType}
                onChange={(e: any) => handleDebtorTypeChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="business">B2B Commercial Debtor</option>
                <option value="consumer">Consumer / Individual Debtor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">AI Relationship Tone *</label>
              <select
                value={relationshipTone}
                onChange={(e: any) => setRelationshipTone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="friendly">Friendly & Warm</option>
                <option value="neutral">Neutral & Professional</option>
                <option value="firm">Firm & Assertive</option>
              </select>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Compliance Disclaimer Statement
            </label>
            <textarea
              rows={3}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
