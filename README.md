# Dynamo Fitness Club — Gym Management System

A production-grade, responsive web-based Gym Management System with a high-conversion public landing page, built for **Dynamo Fitness Club**.

![Dynamo Fitness Club](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80)

---

## ⚡ Key Highlights & Features

- **Public Landing Page**: High-conversion gym portal with animated member counter, hero section, facilities showcase, dynamic live pricing plans, trainers directory, testimonials, honeypot-protected inquiry form, and Google SEO Schema markup.
- **Admin Dashboard**: Real-time KPI cards (Active Members, Monthly Revenue, 7-Day Expiring Memberships, Unread Inquiries), quick action follow-ups, and collection feed.
- **Member Directory**: Instant search across name, phone, and member code (`DFC-M-XXXX`), filter tabs (All, Active, Expiring, Expired, Inactive, Archived), WhatsApp integration, and CSV export.
- **Atomic Registration Flow**: Register athlete + assign plan + compute dynamic expiry + issue first payment receipt atomically with idempotency protection.
- **Financial Ledger & Receipts**:
  - Full and partial installment payments with live balance due calculation.
  - Official printable & downloadable digital receipts with verification QR code.
  - Indian currency words conversion (`Rupees Thirteen Thousand Five Hundred Only`).
  - Immutable cancellation with mandatory reasoning and automated replacement reissue tracking.
- **Membership Plan Management**: Configure plans, duration in days, base fees, and toggle public landing page visibility.
- **Audit Ledger**: Immutable append-only record tracking every member creation, update, payment, and receipt cancellation.
- **Dual-Mode Architecture**: Works seamlessly with live Supabase PostgreSQL (Row Level Security & Atomic RPCs) or in zero-config offline/demo mode with realistic seeded data.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Custom Neon Cyberpunk & Athletic Theme Tokens
- **Icons**: Lucide React
- **State Management**: TanStack Query + React Context
- **Forms & Validation**: React Hook Form + Zod
- **Receipts & Verification**: HTML5 Print Media + QRCode.js + Indian Numbering
- **Database**: Supabase / PostgreSQL 15+ (Row Level Security, Sequences, Triggers, Views, RPCs)
- **Testing**: Vitest (14 unit tests covering money arithmetic, validators, expiry logic, and number-to-words)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 2. Clone & Install
```bash
git clone <repository-url>
cd "Dynamo Fitness Club"
npm install
```

### 3. Environment Setup
The project includes a `.env` file configured for local demo mode. To connect your live Supabase database, update `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```
Navigate to:
- Public Landing Page: [http://localhost:5173/](http://localhost:5173/)
- Admin Login: [http://localhost:5173/auth/login](http://localhost:5173/auth/login)

> **Demo Login Credentials:**
> - Email: `admin@dynamofitness.in`
> - Password: `admin123` (or any password ≥ 6 characters in demo mode)

---

## 🗄️ Database Setup (Supabase)

All SQL migrations and seed data are located in the `supabase/` directory:

1. **Initial Schema**: [`supabase/migrations/20261011000000_initial_schema.sql`](supabase/migrations/20261011000000_initial_schema.sql)
   - Tables: `profiles`, `members`, `membership_plans`, `memberships`, `payments`, `receipts`, `gym_settings`, `audit_logs`, `enquiries`
   - Sequences: `member_code_seq`, `receipt_number_seq`
   - Views: `members_with_status`, `active_membership_plans`, `public_gym_settings`
   - Functions & RPCs: `register_member_with_membership`, `record_payment_and_issue_receipt`, `cancel_and_reissue_receipt`, `submit_enquiry`
   - Row Level Security (RLS) policies for complete role-based isolation.
2. **Seed Data**: [`supabase/seed.sql`](supabase/seed.sql)
   - Populates 4 standard packages, gym contact info, and 20 realistic athletes with active, expiring, and expired memberships.

To execute via Supabase CLI:
```bash
supabase db reset
```
Or copy and run the SQL files directly in the Supabase Dashboard SQL Editor.

---

## 🧪 Testing & Linting

Run automated unit test suite:
```bash
npm run test
```
Run linter:
```bash
npm run lint
```
Build for production:
```bash
npm run build
```

---

## 📄 License
Commercial License — Dynamo Fitness Club. All Rights Reserved.
