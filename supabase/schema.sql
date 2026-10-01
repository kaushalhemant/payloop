-- ==============================================================================
-- PayLoop Database Schema for Supabase (PostgreSQL + RLS + Triggers)
-- ==============================================================================

-- 1. Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS (Freelancers) TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    business_name TEXT,
    stripe_connect_account_id TEXT,
    stripe_connect_status TEXT DEFAULT 'not_connected' CHECK (stripe_connect_status IN ('not_connected', 'pending', 'active')),
    fee_percent NUMERIC(5, 2) DEFAULT 5.00 NOT NULL,
    autopilot_enabled BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    relationship_tone TEXT DEFAULT 'friendly' NOT NULL CHECK (relationship_tone IN ('friendly', 'neutral', 'firm')),
    debtor_type TEXT DEFAULT 'business' NOT NULL CHECK (debtor_type IN ('business', 'consumer')),
    compliance_disclaimer TEXT,
    autopilot_override BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    invoice_number TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'sent', 'overdue', 'paid', 'cancelled')),
    days_overdue INTEGER DEFAULT 0 NOT NULL,
    current_stage INTEGER DEFAULT 1 NOT NULL CHECK (current_stage BETWEEN 1 AND 4),
    stripe_checkout_url TEXT,
    stripe_session_id TEXT,
    autopilot_enabled BOOLEAN DEFAULT false NOT NULL,
    pause_auto_send BOOLEAN DEFAULT false NOT NULL,
    notes TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 4),
    channel TEXT DEFAULT 'email' NOT NULL CHECK (channel IN ('email', 'sms')),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'pending_review', 'scheduled', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_user BOOLEAN DEFAULT false NOT NULL,
    resend_email_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. PAYMENTS (Payout Split Log) TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(12, 2) NOT NULL,
    freelancer_payout NUMERIC(12, 2) NOT NULL,
    stripe_payment_id TEXT NOT NULL,
    stripe_transfer_id TEXT,
    stripe_connect_account_id TEXT,
    status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date ON public.invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_messages_invoice_id ON public.messages(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper RLS Policies for Supabase Auth (auth.uid() = user_id)
CREATE POLICY "Users can manage their own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own invoices" ON public.invoices
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages for their invoices" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE public.invoices.id = public.messages.invoice_id 
            AND public.invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view payments for their invoices" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE public.invoices.id = public.payments.invoice_id 
            AND public.invoices.user_id = auth.uid()
        )
    );
