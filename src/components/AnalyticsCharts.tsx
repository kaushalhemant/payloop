'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  MailCheck,
  MousePointerClick,
  Clock,
  Inbox,
} from 'lucide-react';
import { Invoice, Payment, Message } from '@/types';

interface AnalyticsChartsProps {
  invoices: Invoice[];
  payments: Payment[];
  messages: Message[];
}

export function AnalyticsCharts({ invoices, payments, messages }: AnalyticsChartsProps) {
  // Generate dynamic 6-month timeline based on current date
  const generateMonthlyData = () => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Filter payments that occurred in this month
      const monthPayments = payments.filter((p) => {
        const pDate = new Date(p.created_at);
        const pYearMonth = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        return pYearMonth === yearMonth;
      });

      const recovered = monthPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
      const fees = monthPayments.reduce((sum, p) => sum + (p.platform_fee || 0), 0);

      months.push({
        month: monthLabel,
        recovered,
        fees,
        invoices: monthPayments.length,
      });
    }

    return months;
  };

  const monthlyData = generateMonthlyData();

  // 2. Escalation Stage Distribution
  const stageCounts = [
    { stage: 'Stage 1 (1-6d)', count: invoices.filter((i) => i.current_stage === 1 && i.status === 'overdue').length, color: '#3B82F6' },
    { stage: 'Stage 2 (7-13d)', count: invoices.filter((i) => i.current_stage === 2 && i.status === 'overdue').length, color: '#F59E0B' },
    { stage: 'Stage 3 (14-29d)', count: invoices.filter((i) => i.current_stage === 3 && i.status === 'overdue').length, color: '#F97316' },
    { stage: 'Stage 4 (30d+)', count: invoices.filter((i) => i.current_stage === 4 && i.status === 'overdue').length, color: '#EF4444' },
  ];

  // 3. Email Funnel Rates
  const totalSent = messages.filter((m) => m.sent_at || m.status === 'sent' || m.status === 'opened' || m.status === 'clicked').length;
  const totalOpened = messages.filter((m) => m.opened_at || m.status === 'opened' || m.status === 'clicked').length;
  const totalClicked = messages.filter((m) => m.clicked_at || m.status === 'clicked').length;
  const totalPaid = invoices.filter((i) => i.status === 'paid').length;

  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const conversionRate = invoices.length > 0 ? Math.round((totalPaid / invoices.length) * 100) : 0;

  // 4. Debtor Type Breakdown
  const b2bCount = invoices.filter((i) => i.client?.debtor_type === 'business').length;
  const consumerCount = invoices.filter((i) => i.client?.debtor_type === 'consumer').length;
  const debtorData = invoices.length > 0 ? [
    { name: 'B2B Commercial', value: b2bCount, color: '#10B981' },
    { name: 'Consumer Debtor', value: consumerCount, color: '#6366F1' },
  ] : [
    { name: 'No Invoices', value: 1, color: '#334155' },
  ];

  const totalRecoveredSum = payments.reduce((acc, p) => acc + (p.amount_paid || 0), 0);

  return (
    <div className="space-y-8">
      {/* Response Funnel Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Open Rate</span>
            <div className="text-2xl font-black text-white mt-1">
              {totalSent > 0 ? `${openRate}%` : '0%'}
            </div>
            <span className="text-[11px] text-slate-400">
              {totalOpened} of {totalSent} notices opened
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <MailCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Link CTR</span>
            <div className="text-2xl font-black text-white mt-1">
              {totalSent > 0 ? `${clickRate}%` : '0%'}
            </div>
            <span className="text-[11px] text-cyan-400 font-medium">
              {totalClicked} portal clicks logged
            </span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Recovery Yield</span>
            <div className="text-2xl font-black text-white mt-1">
              {invoices.length > 0 ? `${conversionRate}%` : '0%'}
            </div>
            <span className="text-[11px] text-indigo-400 font-medium">
              {totalPaid} of {invoices.length} invoices settled
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Money Recovered & Fees Timeline */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Recovered Capital & Platform Earnings ($)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly recovery trajectory vs success fee splits
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Total Recovered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Platform Fee Split</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="recovered" name="Recovered ($)" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRecovered)" />
                <Area type="monotone" dataKey="fees" name="Platform Fee ($)" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorFees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Debtor Type & Risk Allocation */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              Debtor Classification
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              B2B commercial vs Consumer debtor regulatory split
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {debtorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            {invoices.length > 0 ? (
              debtorData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-white">{item.value} Invoices</span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-2">
                No active debtor invoices
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Escalation Stage Funnel Bar Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Overdue Stage Escalation Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active volume of overdue invoices progressing through recovery tiers
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="stage" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="count" name="Invoices" radius={[8, 8, 0, 0]}>
                {stageCounts.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
