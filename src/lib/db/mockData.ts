import { User, Client, Invoice, Message, Payment } from '@/types';

// Clean Default State for Every New User
export const INITIAL_USER: User = {
  id: 'user_default',
  email: '',
  name: 'My Workspace',
  business_name: 'Freelancer / Agency Studio',
  stripe_connect_account_id: '',
  stripe_connect_status: 'not_connected',
  fee_percent: 5.0, // 5% success fee on recovery
  autopilot_enabled: false,
  created_at: new Date().toISOString(),
};

export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_MESSAGES: Message[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];

// Optional Sample Template Data (Available only if user chooses "Load Sample Template" in Sandbox)
export const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'client_sample_01',
    user_id: 'user_default',
    name: 'Marcus Vance',
    email: 'marcus@apexdigital.tech',
    phone: '+1 (555) 349-8821',
    company: 'Apex Digital Labs',
    relationship_tone: 'friendly',
    debtor_type: 'business',
    compliance_disclaimer: 'Commercial debt governed under standard B2B net-30 terms and late penalty clauses.',
    autopilot_override: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client_sample_02',
    user_id: 'user_default',
    name: 'Elena Rostova',
    email: 'elena@nexusvc.co',
    phone: '+1 (555) 782-9014',
    company: 'Nexus Ventures',
    relationship_tone: 'firm',
    debtor_type: 'business',
    compliance_disclaimer: 'Commercial debt. Standard commercial contract clauses apply.',
    autopilot_override: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client_sample_03',
    user_id: 'user_default',
    name: 'Sarah Jenkins',
    email: 'sarah.j.creates@gmail.com',
    phone: '+1 (555) 901-4433',
    company: 'Sarah Jenkins Design',
    relationship_tone: 'neutral',
    debtor_type: 'consumer',
    compliance_disclaimer: 'NOTICE: This is a communication concerning an outstanding consumer obligation. Under fair collection standards, you have the right to request debt verification within 30 days.',
    autopilot_override: null,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv_sample_001',
    user_id: 'user_default',
    client_id: 'client_sample_02',
    invoice_number: 'INV-2024-001',
    description: 'Q3 Fullstack Platform Architecture & API Refactor',
    amount: 3200.0,
    currency: 'USD',
    issue_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'overdue',
    days_overdue: 34,
    current_stage: 4,
    stripe_checkout_url: '/pay/inv_sample_001',
    stripe_session_id: 'cs_test_sample_001',
    autopilot_enabled: false,
    pause_auto_send: false,
    notes: 'Nexus CFO acknowledged in email but missed payment deadline.',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv_sample_002',
    user_id: 'user_default',
    client_id: 'client_sample_03',
    invoice_number: 'INV-2024-002',
    description: 'Custom Brand Identity & Interactive Design System',
    amount: 1450.0,
    currency: 'USD',
    issue_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'overdue',
    days_overdue: 16,
    current_stage: 3,
    stripe_checkout_url: '/pay/inv_sample_002',
    stripe_session_id: 'cs_test_sample_002',
    autopilot_enabled: false,
    pause_auto_send: false,
    notes: 'Consumer debtor. Compliance disclaimer required in notices.',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'inv_sample_003',
    user_id: 'user_default',
    client_id: 'client_sample_01',
    invoice_number: 'INV-2024-003',
    description: 'App Performance & Core Web Vitals Sprint',
    amount: 2500.0,
    currency: 'USD',
    issue_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    due_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'paid',
    days_overdue: 0,
    current_stage: 1,
    stripe_checkout_url: '/pay/inv_sample_003',
    stripe_session_id: 'cs_test_sample_003',
    autopilot_enabled: true,
    pause_auto_send: false,
    paid_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'msg_sample_001',
    invoice_id: 'inv_sample_001',
    stage: 4,
    channel: 'email',
    subject: 'FINAL NOTICE: Overdue Payment for Invoice INV-2024-001 ($3,200.00)',
    content: `Dear Elena,\n\nThis is a formal final notice regarding invoice INV-2024-001 for $3,200.00 USD, which is now 34 days past the agreed due date.\n\nDespite our previous reminders, this account remains unsettled. To avoid further escalation or suspension of ongoing deliverables, please settle the outstanding balance immediately using the secure payment link below:\n\n👉 Pay Now Securely: [STRIPE_CHECKOUT_URL]\n\nCommercial debt terms apply.\n\nSincerely,\nPayLoop Automated Recovery`,
    status: 'pending_review',
    reviewed_by_user: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg_sample_002',
    invoice_id: 'inv_sample_002',
    stage: 3,
    channel: 'email',
    subject: 'URGENT: Outstanding Balance for Invoice INV-2024-002 ($1,450.00)',
    content: `Hi Sarah,\n\nI am writing to follow up urgently on invoice INV-2024-002 ($1,450.00 USD), which became overdue 16 days ago.\n\nPlease click below to settle this balance directly:\n\n👉 Settle Invoice Online: [STRIPE_CHECKOUT_URL]\n\nNOTICE: This is a communication concerning an outstanding consumer obligation. Under fair collection standards, you have the right to request debt verification within 30 days.\n\nThank you,\nPayLoop Automated Recovery`,
    status: 'pending_review',
    reviewed_by_user: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: 'pay_sample_001',
    invoice_id: 'inv_sample_003',
    amount_paid: 2500.0,
    platform_fee: 125.0, // 5%
    freelancer_payout: 2375.0,
    stripe_payment_id: 'py_test_sample_001',
    stripe_transfer_id: 'tr_test_sample_001',
    stripe_connect_account_id: 'acct_sample_express',
    status: 'completed',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
