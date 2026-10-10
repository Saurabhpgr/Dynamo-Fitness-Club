-- ============================================================================
-- DYNAMO FITNESS CLUB — INITIAL DATABASE SCHEMA & SECURITY POLICIES
-- PostgreSQL 15+ / Supabase Schema
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. Sequences
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS member_code_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START WITH 1 INCREMENT BY 1;

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

-- PROFILES (Syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- MEMBERS
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members(phone);
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_archived ON public.members(is_archived);
CREATE INDEX IF NOT EXISTS idx_members_search ON public.members USING gin(
  (full_name || ' ' || phone || ' ' || member_code) gin_trgm_ops
);

-- MEMBERSHIP PLANS
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  base_fee NUMERIC(12, 2) NOT NULL CHECK (base_fee >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  plan_name_snapshot TEXT NOT NULL,
  agreed_fee NUMERIC(12, 2) NOT NULL CHECK (agreed_fee >= 0),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT check_dates CHECK (expiry_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_memberships_member_id ON public.memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_memberships_dates ON public.memberships(start_date, expiry_date);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE RESTRICT,
  receipt_number TEXT UNIQUE NOT NULL,
  amount_charged NUMERIC(12, 2) NOT NULL CHECK (amount_charged >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0 AND discount <= amount_charged),
  amount_received NUMERIC(12, 2) NOT NULL CHECK (amount_received >= 0),
  balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_due >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'card', 'other')),
  transaction_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  notes TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_membership_id ON public.payments(membership_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- PAYMENT ADJUSTMENTS
CREATE TABLE IF NOT EXISTS public.payment_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('refund', 'correction')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  new_receipt_number TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RECEIPTS
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT UNIQUE NOT NULL,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE RESTRICT,
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'cancelled', 'reissued')),
  cancelled_by_receipt_id UUID REFERENCES public.receipts(id),
  cancellation_reason TEXT,
  snapshot_data JSONB NOT NULL,
  issued_by UUID REFERENCES public.profiles(id),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON public.receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON public.receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_member_id ON public.receipts(member_id);

-- GYM SETTINGS (Singleton configuration row)
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_name TEXT NOT NULL DEFAULT 'Dynamo Fitness Club',
  address TEXT NOT NULL DEFAULT 'Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210',
  phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  email TEXT NOT NULL DEFAULT 'info@dynamofitness.in',
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  receipt_footer TEXT NOT NULL DEFAULT 'Thank you for choosing Dynamo Fitness Club! Stay fit, stay strong.',
  receipt_number_prefix TEXT NOT NULL DEFAULT 'DFC',
  partial_payments_enabled BOOLEAN NOT NULL DEFAULT true,
  social_links JSONB NOT NULL DEFAULT '{"instagram": "dynamofitness_club", "facebook": "dynamofitnessclub", "whatsapp": "+919876543210"}'::jsonb,
  operating_hours TEXT NOT NULL DEFAULT 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 12:00 PM',
  tax_config JSONB NOT NULL DEFAULT '{"enabled": false, "tax_name": "GST", "rate": 18, "registration_no": ""}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- AUDIT LOGS (Immutable append-only ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'cancel', 'reissue', 'refund', 'archive', 'restore', 'login')),
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES public.profiles(id),
  ip_address TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON public.audit_logs(performed_at);

-- ENQUIRIES (Public leads with spam defense)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  honeypot_field TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  submitted_from INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_is_read ON public.enquiries(is_read);

-- ----------------------------------------------------------------------------
-- 3. Views
-- ----------------------------------------------------------------------------

-- Members with live computed status and active plan information
CREATE OR REPLACE VIEW public.members_with_status AS
SELECT 
  m.id,
  m.member_code,
  m.full_name,
  m.phone,
  m.email,
  m.date_of_birth,
  m.address,
  m.emergency_contact_name,
  m.emergency_contact_phone,
  m.notes,
  m.is_archived,
  m.created_by,
  m.created_at,
  m.updated_at,
  CASE
    WHEN m.is_archived THEN 'archived'
    WHEN EXISTS (
      SELECT 1 FROM public.memberships ms
      WHERE ms.member_id = m.id
        AND ms.status = 'active'
        AND CURRENT_DATE BETWEEN ms.start_date AND ms.expiry_date
    ) THEN 'active'
    WHEN EXISTS (
      SELECT 1 FROM public.memberships ms
      WHERE ms.member_id = m.id
    ) THEN 'expired'
    ELSE 'inactive'
  END AS computed_status,
  (
    SELECT ms.expiry_date 
    FROM public.memberships ms
    WHERE ms.member_id = m.id AND ms.status = 'active'
    ORDER BY ms.expiry_date DESC 
    LIMIT 1
  ) AS current_expiry_date,
  (
    SELECT ms.plan_name_snapshot 
    FROM public.memberships ms
    WHERE ms.member_id = m.id AND ms.status = 'active'
    ORDER BY ms.expiry_date DESC 
    LIMIT 1
  ) AS current_plan_name,
  (
    SELECT ms.id 
    FROM public.memberships ms
    WHERE ms.member_id = m.id AND ms.status = 'active'
    ORDER BY ms.expiry_date DESC 
    LIMIT 1
  ) AS current_membership_id
FROM public.members m;

-- Public view for active plans (used by landing page)
CREATE OR REPLACE VIEW public.active_membership_plans AS
SELECT 
  id,
  name,
  duration_days,
  base_fee,
  sort_order
FROM public.membership_plans
WHERE is_active = true
ORDER BY sort_order ASC, base_fee ASC;

-- Public gym info
CREATE OR REPLACE VIEW public.public_gym_settings AS
SELECT 
  gym_name,
  address,
  phone,
  email,
  logo_url,
  operating_hours,
  social_links
FROM public.gym_settings
LIMIT 1;

-- ----------------------------------------------------------------------------
-- 4. Helper Functions & Triggers
-- ----------------------------------------------------------------------------

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Format next member code: DFC-M-0001
CREATE OR REPLACE FUNCTION public.generate_member_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('member_code_seq');
  RETURN 'DFC-M-' || LPAD(seq_val::text, 4, '0');
END;
$$;

-- Format receipt number: DFC-YYYY-00001
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
  year_str TEXT;
BEGIN
  seq_val := nextval('receipt_number_seq');
  year_str := to_char(CURRENT_DATE, 'YYYY');
  RETURN 'DFC-' || year_str || '-' || LPAD(seq_val::text, 5, '0');
END;
$$;

-- Auto-sync auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at timestamp updater
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_membership_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_gym_settings_updated_at BEFORE UPDATE ON public.gym_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Atomic RPC Functions
-- ----------------------------------------------------------------------------

-- RPC: Register Member with Membership and optional first payment
CREATE OR REPLACE FUNCTION public.register_member_with_membership(
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_emergency_contact_name TEXT DEFAULT NULL,
  p_emergency_contact_phone TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_plan_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_agreed_fee NUMERIC DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_amount_received NUMERIC DEFAULT NULL,
  p_discount NUMERIC DEFAULT 0.00,
  p_transaction_reference TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_id UUID;
  v_member_code TEXT;
  v_membership_id UUID;
  v_payment_id UUID;
  v_receipt_id UUID;
  v_receipt_no TEXT;
  v_plan RECORD;
  v_expiry_date DATE;
  v_final_agreed_fee NUMERIC(12, 2);
  v_amount_received NUMERIC(12, 2);
  v_discount NUMERIC(12, 2);
  v_balance_due NUMERIC(12, 2);
  v_payment_status TEXT;
  v_snapshot JSONB;
  v_gym RECORD;
  v_result JSONB;
BEGIN
  -- Security check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only admin can register members';
  END IF;

  -- 1. Input validations
  IF TRIM(p_full_name) = '' THEN
    RAISE EXCEPTION 'Full name is required';
  END IF;
  IF TRIM(p_phone) = '' THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;

  -- 2. Generate Member Code
  v_member_code := public.generate_member_code();

  -- 3. Insert Member
  INSERT INTO public.members (
    member_code, full_name, phone, email, date_of_birth,
    address, emergency_contact_name, emergency_contact_phone,
    notes, created_by
  )
  VALUES (
    v_member_code, TRIM(p_full_name), TRIM(p_phone), NULLIF(TRIM(p_email), ''),
    p_date_of_birth, NULLIF(TRIM(p_address), ''), NULLIF(TRIM(p_emergency_contact_name), ''),
    NULLIF(TRIM(p_emergency_contact_phone), ''), NULLIF(TRIM(p_notes), ''),
    auth.uid()
  )
  RETURNING id INTO v_member_id;

  -- 4. Record Audit Log for Member
  INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, performed_by)
  VALUES ('member', v_member_id, 'create', jsonb_build_object('code', v_member_code, 'name', p_full_name), auth.uid());

  -- 5. Membership assignment (if plan provided)
  IF p_plan_id IS NOT NULL THEN
    SELECT * INTO v_plan FROM public.membership_plans WHERE id = p_plan_id AND is_active = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Selected membership plan not found or inactive';
    END IF;

    v_expiry_date := p_start_date + (v_plan.duration_days || ' days')::INTERVAL;
    v_final_agreed_fee := COALESCE(p_agreed_fee, v_plan.base_fee);

    INSERT INTO public.memberships (
      member_id, plan_id, plan_name_snapshot, agreed_fee,
      start_date, expiry_date, status, created_by
    )
    VALUES (
      v_member_id, p_plan_id, v_plan.name, v_final_agreed_fee,
      p_start_date, v_expiry_date, 'active', auth.uid()
    )
    RETURNING id INTO v_membership_id;

    -- Record Audit Log for Membership
    INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, performed_by)
    VALUES ('membership', v_membership_id, 'create', jsonb_build_object('plan', v_plan.name, 'start', p_start_date, 'expiry', v_expiry_date), auth.uid());

    -- 6. Optional Payment & Receipt
    IF p_amount_received IS NOT NULL AND p_amount_received > 0 THEN
      IF p_idempotency_key IS NULL OR TRIM(p_idempotency_key) = '' THEN
        RAISE EXCEPTION 'Idempotency key is required when recording payment';
      END IF;

      -- Check idempotency
      SELECT id INTO v_payment_id FROM public.payments WHERE idempotency_key = p_idempotency_key;
      IF FOUND THEN
        SELECT r.receipt_number INTO v_receipt_no FROM public.receipts r WHERE r.payment_id = v_payment_id;
      ELSE
        v_amount_received := p_amount_received;
        v_discount := COALESCE(p_discount, 0.00);
        v_balance_due := GREATEST(0.00, v_final_agreed_fee - v_discount - v_amount_received);

        IF v_balance_due = 0.00 THEN
          v_payment_status := 'paid';
        ELSE
          v_payment_status := 'partial';
        END IF;

        v_receipt_no := public.generate_receipt_number();

        INSERT INTO public.payments (
          member_id, membership_id, receipt_number, amount_charged,
          discount, amount_received, balance_due, payment_method,
          transaction_reference, status, payment_date, idempotency_key,
          created_by
        )
        VALUES (
          v_member_id, v_membership_id, v_receipt_no, v_final_agreed_fee,
          v_discount, v_amount_received, v_balance_due, COALESCE(p_payment_method, 'cash'),
          p_transaction_reference, v_payment_status, now(), p_idempotency_key,
          auth.uid()
        )
        RETURNING id INTO v_payment_id;

        -- Fetch gym settings for receipt snapshot
        SELECT * INTO v_gym FROM public.gym_settings LIMIT 1;

        -- Build snapshot
        v_snapshot := jsonb_build_object(
          'receipt_number', v_receipt_no,
          'issued_at', now(),
          'member', jsonb_build_object(
            'id', v_member_id,
            'code', v_member_code,
            'name', p_full_name,
            'phone', p_phone,
            'email', p_email
          ),
          'membership', jsonb_build_object(
            'plan_name', v_plan.name,
            'start_date', p_start_date,
            'expiry_date', v_expiry_date
          ),
          'payment', jsonb_build_object(
            'amount_charged', v_final_agreed_fee,
            'discount', v_discount,
            'amount_received', v_amount_received,
            'balance_due', v_balance_due,
            'payment_method', COALESCE(p_payment_method, 'cash'),
            'transaction_reference', p_transaction_reference
          ),
          'gym', jsonb_build_object(
            'name', COALESCE(v_gym.gym_name, 'Dynamo Fitness Club'),
            'address', v_gym.address,
            'phone', v_gym.phone,
            'footer', v_gym.receipt_footer
          )
        );

        INSERT INTO public.receipts (
          receipt_number, payment_id, member_id, membership_id,
          status, snapshot_data, issued_by
        )
        VALUES (
          v_receipt_no, v_payment_id, v_member_id, v_membership_id,
          'issued', v_snapshot, auth.uid()
        )
        RETURNING id INTO v_receipt_id;

        -- Record Audit Log for Payment
        INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, performed_by)
        VALUES ('payment', v_payment_id, 'create', jsonb_build_object('receipt', v_receipt_no, 'received', v_amount_received), auth.uid());
      END IF;
    END IF;
  END IF;

  v_result := jsonb_build_object(
    'member_id', v_member_id,
    'member_code', v_member_code,
    'membership_id', v_membership_id,
    'payment_id', v_payment_id,
    'receipt_number', v_receipt_no
  );

  RETURN v_result;
END;
$$;

-- RPC: Record Payment and Issue Receipt
CREATE OR REPLACE FUNCTION public.record_payment_and_issue_receipt(
  p_member_id UUID,
  p_membership_id UUID,
  p_amount_charged NUMERIC,
  p_amount_received NUMERIC,
  p_discount NUMERIC DEFAULT 0.00,
  p_payment_method TEXT DEFAULT 'cash',
  p_transaction_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member RECORD;
  v_membership RECORD;
  v_gym RECORD;
  v_payment_id UUID;
  v_receipt_id UUID;
  v_receipt_no TEXT;
  v_balance_due NUMERIC(12, 2);
  v_payment_status TEXT;
  v_snapshot JSONB;
BEGIN
  -- Security check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_idempotency_key IS NULL OR TRIM(p_idempotency_key) = '' THEN
    RAISE EXCEPTION 'Idempotency key is required';
  END IF;

  -- Check existing idempotency
  SELECT p.id, p.receipt_number INTO v_payment_id, v_receipt_no 
  FROM public.payments p 
  WHERE p.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    SELECT id INTO v_receipt_id FROM public.receipts WHERE receipt_number = v_receipt_no;
    RETURN jsonb_build_object('payment_id', v_payment_id, 'receipt_number', v_receipt_no, 'receipt_id', v_receipt_id);
  END IF;

  -- Validate member
  SELECT * INTO v_member FROM public.members WHERE id = p_member_id AND NOT is_archived;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active member not found';
  END IF;

  -- Validate membership
  SELECT * INTO v_membership FROM public.memberships WHERE id = p_membership_id AND member_id = p_member_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership not found for this member';
  END IF;

  v_balance_due := GREATEST(0.00, p_amount_charged - COALESCE(p_discount, 0.00) - p_amount_received);
  IF v_balance_due = 0.00 THEN
    v_payment_status := 'paid';
  ELSE
    v_payment_status := 'partial';
  END IF;

  v_receipt_no := public.generate_receipt_number();

  INSERT INTO public.payments (
    member_id, membership_id, receipt_number, amount_charged,
    discount, amount_received, balance_due, payment_method,
    transaction_reference, status, payment_date, notes,
    idempotency_key, created_by
  )
  VALUES (
    p_member_id, p_membership_id, v_receipt_no, p_amount_charged,
    COALESCE(p_discount, 0.00), p_amount_received, v_balance_due, p_payment_method,
    p_transaction_reference, v_payment_status, now(), p_notes,
    p_idempotency_key, auth.uid()
  )
  RETURNING id INTO v_payment_id;

  SELECT * INTO v_gym FROM public.gym_settings LIMIT 1;

  v_snapshot := jsonb_build_object(
    'receipt_number', v_receipt_no,
    'issued_at', now(),
    'member', jsonb_build_object(
      'id', v_member.id,
      'code', v_member.member_code,
      'name', v_member.full_name,
      'phone', v_member.phone,
      'email', v_member.email
    ),
    'membership', jsonb_build_object(
      'plan_name', v_membership.plan_name_snapshot,
      'start_date', v_membership.start_date,
      'expiry_date', v_membership.expiry_date
    ),
    'payment', jsonb_build_object(
      'amount_charged', p_amount_charged,
      'discount', COALESCE(p_discount, 0.00),
      'amount_received', p_amount_received,
      'balance_due', v_balance_due,
      'payment_method', p_payment_method,
      'transaction_reference', p_transaction_reference
    ),
    'gym', jsonb_build_object(
      'name', COALESCE(v_gym.gym_name, 'Dynamo Fitness Club'),
      'address', v_gym.address,
      'phone', v_gym.phone,
      'footer', v_gym.receipt_footer
    )
  );

  INSERT INTO public.receipts (
    receipt_number, payment_id, member_id, membership_id,
    status, snapshot_data, issued_by
  )
  VALUES (
    v_receipt_no, v_payment_id, p_member_id, p_membership_id,
    'issued', v_snapshot, auth.uid()
  )
  RETURNING id INTO v_receipt_id;

  INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, performed_by)
  VALUES ('payment', v_payment_id, 'create', jsonb_build_object('receipt', v_receipt_no, 'received', p_amount_received), auth.uid());

  RETURN jsonb_build_object(
    'payment_id', v_payment_id,
    'receipt_id', v_receipt_id,
    'receipt_number', v_receipt_no
  );
END;
$$;

-- RPC: Cancel and Reissue Receipt
CREATE OR REPLACE FUNCTION public.cancel_and_reissue_receipt(
  p_receipt_id UUID,
  p_reason TEXT,
  p_reissue BOOLEAN DEFAULT false,
  p_new_amount_received NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_receipt RECORD;
  v_new_receipt_id UUID;
  v_new_receipt_no TEXT;
  v_new_snapshot JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_old_receipt FROM public.receipts WHERE id = p_receipt_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Receipt not found';
  END IF;
  IF v_old_receipt.status != 'issued' THEN
    RAISE EXCEPTION 'Receipt is already cancelled or reissued';
  END IF;

  -- Cancel the old receipt
  UPDATE public.receipts
  SET status = 'cancelled',
      cancellation_reason = p_reason,
      cancelled_at = now()
  WHERE id = p_receipt_id;

  INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, performed_by)
  VALUES ('receipt', p_receipt_id, 'cancel', jsonb_build_object('reason', p_reason), auth.uid());

  -- Reissue if requested
  IF p_reissue THEN
    v_new_receipt_no := public.generate_receipt_number();
    v_new_snapshot := v_old_receipt.snapshot_data || jsonb_build_object(
      'receipt_number', v_new_receipt_no,
      'reissued_from', v_old_receipt.receipt_number,
      'issued_at', now()
    );

    IF p_new_amount_received IS NOT NULL THEN
      v_new_snapshot := jsonb_set(
        v_new_snapshot,
        '{payment,amount_received}',
        to_jsonb(p_new_amount_received)
      );
    END IF;

    INSERT INTO public.receipts (
      receipt_number, payment_id, member_id, membership_id,
      status, cancelled_by_receipt_id, cancellation_reason,
      snapshot_data, issued_by
    )
    VALUES (
      v_new_receipt_no, v_old_receipt.payment_id, v_old_receipt.member_id, v_old_receipt.membership_id,
      'reissued', p_receipt_id, 'Reissued: ' || p_reason,
      v_new_snapshot, auth.uid()
    )
    RETURNING id INTO v_new_receipt_id;

    INSERT INTO public.audit_logs (entity_type, entity_id, action, new_data, performed_by)
    VALUES ('receipt', v_new_receipt_id, 'reissue', jsonb_build_object('reissued_from', v_old_receipt.receipt_number), auth.uid());

    RETURN jsonb_build_object('cancelled_id', p_receipt_id, 'new_receipt_id', v_new_receipt_id, 'new_receipt_number', v_new_receipt_no);
  END IF;

  RETURN jsonb_build_object('cancelled_id', p_receipt_id);
END;
$$;

-- RPC: Submit Enquiry (Public with spam defense)
CREATE OR REPLACE FUNCTION public.submit_enquiry(
  p_name TEXT,
  p_phone TEXT,
  p_message TEXT DEFAULT NULL,
  p_honeypot TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enquiry_id UUID;
  v_recent_count INT;
BEGIN
  -- 1. Honeypot check (bot trap)
  IF p_honeypot IS NOT NULL AND TRIM(p_honeypot) <> '' THEN
    -- Silently discard spam bots
    RETURN jsonb_build_object('success', true);
  END IF;

  IF TRIM(p_name) = '' OR TRIM(p_phone) = '' THEN
    RAISE EXCEPTION 'Name and phone are required';
  END IF;

  -- 2. Simple rate limit (max 5 per min across anonymous callers)
  SELECT count(*) INTO v_recent_count
  FROM public.enquiries
  WHERE created_at > now() - INTERVAL '1 minute';

  IF v_recent_count >= 10 THEN
    RAISE EXCEPTION 'Too many submissions. Please try again in a few moments.';
  END IF;

  -- 3. Insert enquiry
  INSERT INTO public.enquiries (name, phone, message)
  VALUES (TRIM(p_name), TRIM(p_phone), NULLIF(TRIM(p_message), ''))
  RETURNING id INTO v_enquiry_id;

  RETURN jsonb_build_object('success', true, 'id', v_enquiry_id);
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Users can update own profile name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- MEMBERS Policies (Admin only, no anon)
CREATE POLICY "Admins have full access to members"
  ON public.members FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- MEMBERSHIP PLANS Policies (Public can view active, Admin can manage)
CREATE POLICY "Anyone can view active plans"
  ON public.membership_plans FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to plans"
  ON public.membership_plans FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- MEMBERSHIPS Policies
CREATE POLICY "Admins have full access to memberships"
  ON public.memberships FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAYMENTS Policies
CREATE POLICY "Admins have full access to payments"
  ON public.payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PAYMENT ADJUSTMENTS Policies
CREATE POLICY "Admins have full access to adjustments"
  ON public.payment_adjustments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RECEIPTS Policies
CREATE POLICY "Admins have full access to receipts"
  ON public.receipts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- GYM SETTINGS Policies (Public view, Admin update)
CREATE POLICY "Anyone can view gym settings"
  ON public.gym_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update gym settings"
  ON public.gym_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- AUDIT LOGS Policies (Admin read-only, triggers insert)
CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- ENQUIRIES Policies (Anon can insert via RPC or direct insert with empty honeypot, Admin can view)
CREATE POLICY "Anon can insert enquiry"
  ON public.enquiries FOR INSERT
  WITH CHECK (honeypot_field IS NULL OR honeypot_field = '');

CREATE POLICY "Admins can view enquiries"
  ON public.enquiries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update enquiry read status"
  ON public.enquiries FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
