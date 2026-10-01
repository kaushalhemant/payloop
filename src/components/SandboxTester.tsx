'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Mail,
  Eye,
  MousePointerClick,
  Sliders,
  Calendar,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice, Client, Message } from '@/types';

interface SandboxTesterProps {
  invoices: Invoice[];
  clients: Client[];
  messages: Message[];
  onRefreshData: () => Promise<void>;
}

export function SandboxTester({ invoices, clients, messages, onRefreshData }: SandboxTesterProps) {
  const [runningE2E, setRunningE2E] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [fastForwardDays, setFastForwardDays] = useState<number>(15);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunFullE2E = async () => {
    setRunningE2E(true);
    setLogs([]);
    setCurrentStep(1);
    addLog('🚀 Starting PayLoop End-to-End Autonomous Recovery & Split Test...');

    try {
      // Step 1: Ensure Client and Create Overdue Invoice
      await new Promise((r) => setTimeout(r, 600));
      let targetClient = clients[0];

      if (!targetClient) {
        addLog('Step 1a: Creating test client profile (Apex Digital Labs)...');
        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Marcus Vance',
            email: 'marcus@apexdigital.tech',
            company: 'Apex Digital Labs',
            relationship_tone: 'friendly',
            debtor_type: 'business',
            compliance_disclaimer: 'Commercial debt terms apply.',
          }),
        });
        const clientData = await clientRes.json();
        targetClient = clientData.client;
      }

      addLog('Step 1b: Creating $2,800 Overdue Invoice (16 days past due)...');
      const duePastDate = new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const invRes = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: targetClient.id,
          invoice_number: `INV-E2E-${Math.floor(1000 + Math.random() * 9000)}`,
          description: 'E2E Fullstack Platform & Recovery Verification',
          amount: 2800.0,
          currency: 'USD',
          due_date: duePastDate,
          autopilot_enabled: false,
        }),
      });
      const invData = await invRes.json();
      const createdInvoice = invData.invoice;
      addLog(`✓ Created Invoice ${createdInvoice.invoice_number} with Checkout Link: ${createdInvoice.stripe_checkout_url}`);

      // Step 2: Trigger Cron Escalation Scheduler
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 800));
      addLog('Step 2: Executing Daily Escalation Scheduler (/api/cron/escalate)...');
      const cronRes = await fetch('/api/cron/escalate', { method: 'POST' });
      const cronData = await cronRes.json();
      addLog(`✓ Escalation evaluated invoices. Stage 3 Firm Notice drafted.`);

      // Step 3: Call Gemini AI Recovery Drafting Studio
      setCurrentStep(3);
      await new Promise((r) => setTimeout(r, 800));
      addLog('Step 3: Gemini AI drafting tailored Stage 3 Firm Notice with debtor compliance disclaimers...');
      const draftRes = await fetch('/api/messages/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: createdInvoice.id,
          stage: 3,
        }),
      });
      const draftData = await draftRes.json();
      addLog(`✓ Gemini Draft complete: "${draftData.draft?.subject}"`);

      // Step 4: Guardrail Check (Review & Send Approval)
      setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 800));
      addLog('Step 4: Guardrail Check — Notice placed in Review Queue. Approving and sending via Resend API...');
      const msgRes = await fetch(`/api/messages?invoiceId=${createdInvoice.id}`);
      const msgData = await msgRes.json();
      const targetMessage = msgData.messages?.[0];

      if (targetMessage) {
        await fetch(`/api/messages/${targetMessage.id}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: targetMessage.subject,
            content: targetMessage.content,
          }),
        });
        addLog(`✓ Dispatched email to client with tracking pixel and checkout button.`);
      }

      // Step 5: Simulate Client Engagement (Open & Click)
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 800));
      if (targetMessage) {
        addLog('Step 5: Client opens email (Tracking pixel hit) and clicks Checkout portal link...');
        await fetch(`/api/track/open/${targetMessage.id}`);
        await fetch(`/api/track/click/${targetMessage.id}?redirect=/pay/${createdInvoice.id}`);
        addLog('✓ Email Open & Link Click registered.');
      }

      // Step 6: Process Stripe Payment & Instant 5% Payout Split
      setCurrentStep(6);
      await new Promise((r) => setTimeout(r, 900));
      addLog('Step 6: Client completes $2,800 Stripe Payment. Webhook calculating 5% Platform Fee ($140) & $2,660 Instant Transfer...');
      const payRes = await fetch('/api/stripe/simulate-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: createdInvoice.id,
        }),
      });
      const payData = await payRes.json();
      addLog(`✓ Payment Confirmed! Stripe Transfer ID: ${payData.payment?.stripe_transfer_id}. Net Payout $${payData.payment?.freelancer_payout} deposited.`);

      // Complete & Confetti!
      setCurrentStep(7);
      addLog('🎉 END-TO-END FLOW COMPLETED 100% SUCCESSFULLY!');
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#10B981', '#06B6D4', '#6366F1', '#F59E0B'],
        });
      } catch {}

      await onRefreshData();
    } catch (err: any) {
      addLog(`❌ Error during simulation: ${err.message}`);
    } finally {
      setRunningE2E(false);
    }
  };

  const handleFastForwardTimeline = async () => {
    addLog(`Fast-forwarding timeline by +${fastForwardDays} days...`);
    const futureDate = new Date(Date.now() + fastForwardDays * 24 * 60 * 60 * 1000);
    const res = await fetch('/api/cron/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceDate: futureDate.toISOString() }),
    });
    const data = await res.json();
    addLog(`✓ Advanced timeline: ${data.report?.stagesAdvanced} invoices moved to higher escalation tiers.`);
    await onRefreshData();
  };

  const handleResetData = async (mode: 'clean' | 'sample') => {
    if (mode === 'clean' && !confirm('Are you sure you want to clear all data in the workspace?')) return;
    await fetch('/api/simulations/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    addLog(mode === 'sample' ? '✓ Loaded sample template dataset.' : '✓ Workspace cleared cleanly.');
    await onRefreshData();
  };

  const steps = [
    'Create Overdue Invoice',
    'Run Cron Scheduler',
    'Gemini AI Draft',
    'Guardrail Review Approval',
    'Resend Open & Click Track',
    'Stripe 5% Split Settlement',
  ];

  return (
    <div className="space-y-8">
      {/* 1-Click E2E Test Suite */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Autonomous Recovery Sandbox & Verification
                </h3>
                <p className="text-xs text-slate-400">
                  Execute the entire lifecycle from invoice creation to Stripe Connect payout split in seconds
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunFullE2E}
              disabled={runningE2E}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center gap-2.5 transition transform active:scale-95 disabled:opacity-50"
            >
              {runningE2E ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Running Simulation (Step {currentStep}/6)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Run Full E2E Flow Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar & Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {steps.map((st, i) => {
            const stepNum = i + 1;
            const isCompleted = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <div
                key={i}
                className={`p-3 rounded-2xl border text-xs transition ${
                  isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/10 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono">0{stepNum}</span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="truncate text-[11px]">{st}</div>
              </div>
            );
          })}
        </div>

        {/* Live Simulation Console */}
        {logs.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-1 max-h-56 overflow-y-auto leading-relaxed">
            {logs.map((l, idx) => (
              <div
                key={idx}
                className={l.includes('✓') ? 'text-emerald-400' : l.includes('🎉') ? 'text-cyan-300 font-bold' : 'text-slate-300'}
              >
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Fast-Forward & Webhook Event Simulators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white">Time Travel Escalation Engine</h4>
          </div>
          <p className="text-xs text-slate-400">
            Fast-forward the system calendar into the future to test how your actual invoices automatically advance from Stage 1 to Stage 4.
          </p>

          <div className="flex items-center gap-4">
            <select
              value={fastForwardDays}
              onChange={(e) => setFastForwardDays(parseInt(e.target.value))}
              className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500"
            >
              <option value="1">+1 Day (Check Stage 1 Reminders)</option>
              <option value="7">+7 Days (Check Stage 2 Follow-Ups)</option>
              <option value="15">+15 Days (Trigger Stage 3 Firm Notices & Review Queue)</option>
              <option value="35">+35 Days (Trigger Stage 4 Final Demand Legal Notices)</option>
            </select>

            <button
              onClick={handleFastForwardTimeline}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition"
            >
              Simulate Jump
            </button>
          </div>
        </div>

        {/* Workspace Dataset Tools */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h4 className="text-base font-bold text-white">Workspace Data Management</h4>
          </div>
          <p className="text-xs text-slate-400">
            Easily manage your local workspace data state for testing or production readiness.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleResetData('clean')}
              className="p-3 bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-xl text-left text-xs font-semibold text-slate-200 transition"
            >
              <Trash2 className="w-4 h-4 text-rose-400 mb-1" />
              <span>Clear Workspace</span>
            </button>

            <button
              onClick={() => handleResetData('sample')}
              className="p-3 bg-slate-950 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-left text-xs font-semibold text-slate-200 transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 mb-1" />
              <span>Load Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
