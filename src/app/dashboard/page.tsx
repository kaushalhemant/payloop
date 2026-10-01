'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FileText,
  ShieldAlert,
  Users,
  Mail,
  BarChart3,
  CreditCard,
  Sparkles,
  Play,
  Plus,
  ArrowUpRight,
  Layers,
  FlaskConical,
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Header } from '@/components/Header';
import { MetricCards } from '@/components/MetricCards';
import { InvoiceTable } from '@/components/InvoiceTable';
import { ReviewQueue } from '@/components/ReviewQueue';
import { ClientList } from '@/components/ClientList';
import { MessageTimeline } from '@/components/MessageTimeline';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { StripeConnectTab } from '@/components/StripeConnectTab';
import { SandboxTester } from '@/components/SandboxTester';

import { NewInvoiceModal } from '@/components/NewInvoiceModal';
import { NewClientModal } from '@/components/NewClientModal';
import { AiDraftModal } from '@/components/AiDraftModal';
import { BatchImportModal } from '@/components/BatchImportModal';
import { EscalationModal } from '@/components/EscalationModal';

import { User, Client, Invoice, Message, Payment, MessageStage } from '@/types';
import { EscalationReport } from '@/lib/cron/escalate';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('invoices');

  // Modal States
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isAiDraftOpen, setIsAiDraftOpen] = useState(false);
  const [selectedAiInvoice, setSelectedAiInvoice] = useState<Invoice | null>(null);
  const [isEscalationOpen, setIsEscalationOpen] = useState(false);
  const [escalationReport, setEscalationReport] = useState<EscalationReport | null>(null);
  const [escalationRunning, setEscalationRunning] = useState(false);

  // Load all initial data
  const fetchData = async () => {
    try {
      const [userRes, invRes, clRes, msgRes, payRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/invoices'),
        fetch('/api/clients'),
        fetch('/api/messages'),
        fetch('/api/stripe/simulate-payout'),
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.user);
      }
      if (invRes.ok) {
        const inv = await invRes.json();
        setInvoices(inv.invoices || []);
      }
      if (clRes.ok) {
        const cl = await clRes.json();
        setClients(cl.clients || []);
      }
      if (msgRes.ok) {
        const msg = await msgRes.json();
        setMessages(msg.messages || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleUpdateUser = async (updates: Partial<User>) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleCreateInvoice = async (invoiceData: any) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleCreateClient = async (clientData: any) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleUpdateClient = async (id: string, updates: Partial<Client>) => {
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleToggleAutopilot = async (invoice: Invoice) => {
    const newStatus = !invoice.autopilot_enabled;
    await fetch(`/api/invoices/${invoice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autopilot_enabled: newStatus }),
    });
    await fetchData();
  };

  const handleTogglePause = async (invoice: Invoice) => {
    const newStatus = !invoice.pause_auto_send;
    await fetch(`/api/invoices/${invoice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pause_auto_send: newStatus }),
    });
    await fetchData();
  };

  const handleRunEscalation = async () => {
    setEscalationRunning(true);
    try {
      const res = await fetch('/api/cron/escalate', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.report) {
        setEscalationReport(data.report);
        setIsEscalationOpen(true);
        await fetchData();
      }
    } catch (err) {
      console.error('Escalation failed:', err);
    } finally {
      setEscalationRunning(false);
    }
  };

  const handleSimulatePayment = async (invoice: Invoice) => {
    try {
      const res = await fetch('/api/stripe/simulate-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoice.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          confetti({
            particleCount: 130,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#10B981', '#06B6D4', '#6366F1', '#F59E0B'],
          });
        } catch {}
        await fetchData();
      } else {
        alert(data.error || 'Payment simulation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Payment simulation error');
    }
  };

  const handleSendMessage = async (messageId: string, subject?: string, content?: string) => {
    const res = await fetch(`/api/messages/${messageId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, content }),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleRegenerateDraft = async (invoiceId: string, stage: MessageStage, instructions?: string) => {
    const res = await fetch('/api/messages/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoice_id: invoiceId,
        stage,
        custom_instructions: instructions,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const targetMsg = messages.find((m) => m.invoice_id === invoiceId && m.stage === stage);
      if (targetMsg) {
        await fetch(`/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: invoiceId,
            stage,
            subject: data.draft.subject,
            content: data.draft.content,
            status: 'pending_review',
          }),
        });
      }
      await fetchData();
    }
  };

  const handleSendDraft = async (draftData: any) => {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draftData,
        status: 'sent',
        reviewed_by_user: true,
      }),
    });
    if (res.ok) {
      await fetchData();
    }
  };

  const handleBatchImport = async (rows: any[]) => {
    for (const r of rows) {
      let client = clients.find((c) => c.email.toLowerCase() === r.clientEmail.toLowerCase());
      if (!client) {
        const clRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: r.clientName,
            email: r.clientEmail,
            company: r.clientName,
            debtor_type: 'business',
            relationship_tone: 'friendly',
          }),
        });
        const clData = await clRes.json();
        client = clData.client;
      }

      if (client) {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: client.id,
            invoice_number: r.invoiceNumber,
            description: r.description,
            amount: r.amount,
            due_date: r.dueDate,
          }),
        });
      }
    }
    await fetchData();
  };

  const handleResetDatabase = async (mode: 'clean' | 'sample' = 'clean') => {
    if (mode === 'clean' && !confirm('Are you sure you want to clear all data in your workspace?')) return;
    await fetch('/api/simulations/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    });
    await fetchData();
  };

  const handleSimulateOpen = async (messageId: string) => {
    await fetch(`/api/track/open/${messageId}`);
    await fetchData();
  };

  const handleSimulateClick = async (messageId: string) => {
    const msg = messages.find((m) => m.id === messageId);
    const inv = msg ? invoices.find((i) => i.id === msg.invoice_id) : null;
    await fetch(`/api/track/click/${messageId}?redirect=${encodeURIComponent(inv?.stripe_checkout_url || `/pay/${inv?.id}`)}`);
    await fetchData();
  };

  const handleConnectStripe = async () => {
    const res = await fetch('/api/stripe/connect', { method: 'POST' });
    const data = await res.json();
    if (data.onboardingUrl) {
      window.open(data.onboardingUrl, '_blank');
    }
    await fetchData();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Initializing PayLoop Recovery Engine...</p>
        </div>
      </div>
    );
  }

  const pendingReviewCount = messages.filter((m) => m.status === 'pending_review').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      {/* Header */}
      <Header
        user={user}
        onOpenNewInvoice={() => setIsNewInvoiceOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenBatchImport={() => setIsBatchImportOpen(true)}
        onRunEscalation={handleRunEscalation}
        onResetDatabase={handleResetDatabase}
        onUpdateUser={handleUpdateUser}
        escalationRunning={escalationRunning}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric KPI Cards */}
        <MetricCards
          invoices={invoices}
          payments={payments}
          messages={messages}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 mb-8 overflow-x-auto gap-2 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'invoices'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Invoices ({invoices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Review Queue</span>
              {pendingReviewCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clients ({clients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'messages'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Communications ({messages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Charts</span>
            </button>

            <button
              onClick={() => setActiveTab('stripe')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'stripe'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Stripe Connect Split</span>
            </button>
          </div>

          <div>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'sandbox'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Simulation Sandbox</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === 'invoices' && (
          <InvoiceTable
            invoices={invoices}
            onDraftAiMessage={(inv) => {
              setSelectedAiInvoice(inv);
              setIsAiDraftOpen(true);
            }}
            onReviewMessage={(inv) => setActiveTab('review')}
            onSimulatePayment={handleSimulatePayment}
            onToggleAutopilot={handleToggleAutopilot}
            onTogglePause={handleTogglePause}
            onDeleteInvoice={handleDeleteInvoice}
            onViewDetails={(inv) => router.push(`/pay/${inv.id}`)}
            onOpenNewInvoice={() => setIsNewInvoiceOpen(true)}
            onOpenBatchImport={() => setIsBatchImportOpen(true)}
          />
        )}

        {activeTab === 'review' && (
          <ReviewQueue
            messages={messages}
            invoices={invoices}
            clients={clients}
            onSendMessage={handleSendMessage}
            onRegenerateDraft={handleRegenerateDraft}
          />
        )}

        {activeTab === 'clients' && (
          <ClientList
            clients={clients}
            invoices={invoices}
            onOpenNewClient={() => setIsNewClientOpen(true)}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}

        {activeTab === 'messages' && (
          <MessageTimeline
            messages={messages}
            invoices={invoices}
            clients={clients}
            onSimulateOpen={handleSimulateOpen}
            onSimulateClick={handleSimulateClick}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts invoices={invoices} payments={payments} messages={messages} />
        )}

        {activeTab === 'stripe' && (
          <StripeConnectTab
            user={user}
            payments={payments}
            invoices={invoices}
            onConnectStripe={handleConnectStripe}
          />
        )}

        {activeTab === 'sandbox' && (
          <SandboxTester
            invoices={invoices}
            clients={clients}
            messages={messages}
            onRefreshData={fetchData}
          />
        )}
      </main>

      {/* Modals */}
      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        clients={clients}
        onClose={() => setIsNewInvoiceOpen(false)}
        onCreateInvoice={handleCreateInvoice}
        onOpenNewClient={() => setIsNewClientOpen(true)}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onCreateClient={handleCreateClient}
      />

      <BatchImportModal
        isOpen={isBatchImportOpen}
        clients={clients}
        onClose={() => setIsBatchImportOpen(false)}
        onBatchImport={handleBatchImport}
      />

      <AiDraftModal
        isOpen={isAiDraftOpen}
        invoice={selectedAiInvoice}
        onClose={() => {
          setIsAiDraftOpen(false);
          setSelectedAiInvoice(null);
        }}
        onSendDraft={handleSendDraft}
      />

      <EscalationModal
        isOpen={isEscalationOpen}
        report={escalationReport}
        onClose={() => setIsEscalationOpen(false)}
        onGoToReviewQueue={() => {
          setIsEscalationOpen(false);
          setActiveTab('review');
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading PayLoop Dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
