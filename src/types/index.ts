export type RelationshipTone = 'friendly' | 'neutral' | 'firm';
export type DebtorType = 'business' | 'consumer';
export type InvoiceStatus = 'draft' | 'sent' | 'overdue' | 'paid' | 'cancelled';
export type MessageStage = 1 | 2 | 3 | 4;
export type MessageChannel = 'email' | 'sms';
export type MessageStatus = 'draft' | 'pending_review' | 'scheduled' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';

export interface User {
  id: string;
  email: string;
  name: string;
  business_name?: string;
  stripe_connect_account_id?: string;
  stripe_connect_status?: 'not_connected' | 'pending' | 'active';
  fee_percent: number; // e.g. 5 for 5%
  autopilot_enabled: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  relationship_tone: RelationshipTone;
  debtor_type: DebtorType;
  compliance_disclaimer?: string;
  autopilot_override?: boolean | null; // null = use global setting
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  client?: Client;
  invoice_number: string;
  description: string;
  amount: number; // in USD
  currency: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  days_overdue: number;
  current_stage: MessageStage;
  stripe_checkout_url?: string;
  stripe_session_id?: string;
  autopilot_enabled: boolean;
  pause_auto_send: boolean;
  notes?: string;
  paid_at?: string;
  created_at: string;
}

export interface Message {
  id: string;
  invoice_id: string;
  invoice?: Invoice;
  stage: MessageStage;
  channel: MessageChannel;
  subject: string;
  content: string;
  status: MessageStatus;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  reviewed_by_user: boolean;
  resend_email_id?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  invoice?: Invoice;
  amount_paid: number;
  platform_fee: number;
  freelancer_payout: number;
  stripe_payment_id: string;
  stripe_transfer_id?: string;
  stripe_connect_account_id?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface EscalationRule {
  stage: MessageStage;
  min_days_overdue: number;
  name: string;
  default_tone_modifier: string;
  requires_review: boolean;
  description: string;
}

export const STAGE_RULES: Record<MessageStage, EscalationRule> = {
  1: {
    stage: 1,
    min_days_overdue: 1,
    name: 'Gentle Reminder',
    default_tone_modifier: 'friendly and helpful',
    requires_review: false,
    description: '1 day overdue: Friendly check-in to confirm invoice was received and offer instant payment link.',
  },
  2: {
    stage: 2,
    min_days_overdue: 7,
    name: 'Follow-Up Nudge',
    default_tone_modifier: 'clear and professional',
    requires_review: false,
    description: '7 days overdue: Professional statement of account reminding of passed due date.',
  },
  3: {
    stage: 3,
    min_days_overdue: 14,
    name: 'Firm Notice',
    default_tone_modifier: 'firm and direct',
    requires_review: true,
    description: '14 days overdue: Urgent reminder with warning of service suspension or late fees (Requires Review).',
  },
  4: {
    stage: 4,
    min_days_overdue: 30,
    name: 'Final Demand',
    default_tone_modifier: 'formal and strict legal advisory',
    requires_review: true,
    description: '30+ days overdue: Formal final demand notice before escalation / collections (Requires Review).',
  },
};
