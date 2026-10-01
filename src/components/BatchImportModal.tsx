'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, X, Upload, CheckCircle2, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { Client } from '@/types';

interface BatchImportModalProps {
  isOpen: boolean;
  clients: Client[];
  onClose: () => void;
  onBatchImport: (invoices: any[]) => Promise<void>;
}

const SAMPLE_CSV = `Client Name,Client Email,Invoice Number,Amount,Due Date,Description
Sarah Jenkins,sarah.j.creates@gmail.com,INV-2024-X10,1850.00,2024-02-14,Xero Brand Sprint
Marcus Vance,marcus@apexdigital.tech,INV-2024-X11,4200.00,2024-01-28,QuickBooks Retainer
David Chen,dchen@hyperscalelabs.io,INV-2024-X12,3100.00,2024-02-20,API Microservices Work`;

export function BatchImportModal({ isOpen, clients, onClose, onBatchImport }: BatchImportModalProps) {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const parseCsv = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) return [];

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 5) {
          rows.push({
            clientName: parts[0],
            clientEmail: parts[1],
            invoiceNumber: parts[2],
            amount: parseFloat(parts[3]),
            dueDate: parts[4],
            description: parts[5] || 'Imported Freelance Invoice',
          });
        }
      }
      return rows;
    } catch {
      return [];
    }
  };

  const handleImport = async () => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      setErrorMsg('No valid invoice rows found in CSV data.');
      return;
    }

    setImporting(true);
    setErrorMsg(null);
    try {
      await onBatchImport(rows);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing batch import');
    } finally {
      setImporting(false);
    }
  };

  const currentParsed = parseCsv(csvText);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Batch Import (QuickBooks / Xero CSV)</h3>
              <p className="text-xs text-slate-400">Bulk ingest unpaid invoices and automatically assign recovery tiers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CSV Editor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-slate-300">Paste CSV Contents</label>
            <button
              type="button"
              onClick={() => setCsvText(SAMPLE_CSV)}
              className="text-cyan-400 hover:underline"
            >
              Reset to Sample Template
            </button>
          </div>
          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Parsed Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Preview Validated Rows ({currentParsed.length})</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Total Value: ${currentParsed.reduce((s, r) => s + (r.amount || 0), 0).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400 bg-slate-900/60">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentParsed.map((r, i) => (
                  <tr key={i} className="text-slate-300">
                    <td className="py-2 px-3 font-bold text-white font-mono">{r.invoiceNumber}</td>
                    <td className="py-2 px-3">{r.clientName}</td>
                    <td className="py-2 px-3 font-mono font-bold text-emerald-400">${r.amount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-rose-400">{r.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Creates Stripe payment checkout URLs for all imported rows
          </div>

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
              onClick={handleImport}
              disabled={importing || currentParsed.length === 0}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {importing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Importing Invoices...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Import {currentParsed.length} Invoices</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
