# 🔄 PayLoop — Autonomous Late-Invoice Recovery & Split Settlement

> An intelligent, autonomous late-invoice recovery protocol built for freelancers, consultants, and agencies. Automatically recovers overdue payments, crafts AI-escalated notices with compliance guardrails, and instantaneously splits success fees at the point of payment.

---

## ⚡ Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS (Fintech Dark/Light Design System)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Triggers, & Indexes) + In-Memory Reactive Cache
- **Payment & Split Protocol**: Stripe (Connect Express, Checkout Sessions, Webhooks, Instant Destination Transfers)
- **AI Engine**: Google Gemini API (`@google/genai` 2.5 Flash) with customizable relationship tone and compliance guardrails
- **Email Delivery & Tracking**: Resend SDK + Embedded 1x1 Open Tracking Pixels + CTR Tracking Links + Webhook Ingestion
- **Analytics & Visuals**: Recharts (Recovered Trajectory, Platform Earnings, Escalation Funnels) + Canvas Confetti
- **Deployment Target**: Vercel + Vercel Cron

---

## 🏗️ Architecture & Data Model

### Data Entities
1. **`users` (Freelancers)**: `id`, `email`, `name`, `business_name`, `stripe_connect_account_id`, `stripe_connect_status`, `fee_percent` (e.g. 5%), `autopilot_enabled`.
2. **`clients`**: `id`, `user_id`, `name`, `email`, `phone`, `company`, `relationship_tone` (`friendly` | `neutral` | `firm`), `debtor_type` (`business` | `consumer`), `compliance_disclaimer`, `autopilot_override`.
3. **`invoices`**: `id`, `user_id`, `client_id`, `invoice_number`, `amount`, `currency`, `issue_date`, `due_date`, `status` (`draft` | `sent` | `overdue` | `paid`), `days_overdue`, `current_stage` (1–4), `stripe_checkout_url`, `autopilot_enabled`, `pause_auto_send`.
4. **`messages`**: `id`, `invoice_id`, `stage` (1–4), `channel` (`email` | `sms`), `subject`, `content`, `status` (`draft` | `pending_review` | `sent` | `opened` | `clicked`), `sent_at`, `opened_at`, `clicked_at`, `reviewed_by_user`.
5. **`payments`**: `id`, `invoice_id`, `amount_paid`, `platform_fee`, `freelancer_payout`, `stripe_payment_id`, `stripe_transfer_id`, `stripe_connect_account_id`, `status`.

---

## 🚦 Recovery Escalation Tiers & Guardrails

| Stage | Trigger | Tone | Guardrail Behavior |
| :--- | :--- | :--- | :--- |
| **Stage 1** | 1–6 Days Overdue | Gentle, warm check-in | Auto-dispatches via Resend with Stripe payment link |
| **Stage 2** | 7–13 Days Overdue | Professional statement of account | Auto-dispatches via Resend |
| **Stage 3** | 14–29 Days Overdue | Firm, urgent notice | **Protected by Review Queue**: Requires manual sign-off unless explicit autopilot is toggled |
| **Stage 4** | 30+ Days Overdue | Final demand & legal advisory | **Protected by Review Queue**: Requires manual sign-off + mandatory FDCPA / B2B disclaimer |

---

## 💰 Instant Success-Fee Split Calculation

When a debtor pays an invoice via Stripe Checkout (e.g. $2,000 with a 5% fee split):
1. **Gross Payment**: `$2,000.00`
2. **PayLoop Platform Fee**: `$100.00` ($2,000 × 5%)
3. **Freelancer Instant Transfer**: `$1,900.00` ($2,000 − $100) deposited directly to `stripe_connect_account_id`.
4. **Webhook**: Atomically updates invoice status to `paid`, logs the transaction in the ledger, and updates dashboard metrics.

---

## 🚀 Quickstart & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Run End-to-End Test Suite
```bash
node test_e2e.mjs
```

---

## 🧪 Simulation Sandbox

PayLoop includes a built-in interactive **Simulation Sandbox** tab:
- **1-Click Full E2E Flow**: Creates an overdue invoice, runs the escalation scheduler, triggers Gemini AI drafting, passes guardrail review, simulates email open/click, executes Stripe payment, and calculates the 5% split with instant celebration.
- **Time Travel Engine**: Fast-forward +1, +7, +15, or +35 days to test stage transitions.
- **Webhook Dispatchers**: Test real-time ingestion for Stripe and Resend webhooks.
