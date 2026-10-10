// ============================================================================
// Dynamo Fitness Club — Core Type Definitions
// ============================================================================

// --- Database Enums ---
export type MemberStatus = 'active' | 'expired' | 'inactive' | 'archived';
export type MembershipStatus = 'active' | 'expired' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type ReceiptStatus = 'issued' | 'cancelled' | 'reissued';
export type AdjustmentType = 'refund' | 'correction';
export type UserRole = 'admin' | 'member' | 'trainer';
export type AuditAction = 'create' | 'update' | 'delete' | 'cancel' | 'reissue' | 'refund' | 'archive' | 'restore' | 'login';

// --- Core Entities ---
export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
  is_archived: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberWithStatus extends Member {
  computed_status: MemberStatus;
  current_expiry_date: string | null;
  current_plan_name: string | null;
}

export interface MembershipPlan {
  id: string;
  name: string;
  duration_days: number;
  base_fee: string; // NUMERIC as string to avoid float issues
  is_active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  member_id: string;
  plan_id: string;
  plan_name_snapshot: string;
  agreed_fee: string;
  start_date: string;
  expiry_date: string;
  status: MembershipStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  membership_id: string;
  receipt_number: string;
  amount_charged: string;
  discount: string;
  amount_received: string;
  balance_due: string;
  payment_method: PaymentMethod;
  transaction_reference: string | null;
  status: PaymentStatus;
  payment_date: string;
  notes: string | null;
  idempotency_key: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithDetails extends Payment {
  member_name: string;
  member_code: string;
  member_phone: string;
  plan_name: string;
  membership_start: string;
  membership_expiry: string;
}

export interface PaymentAdjustment {
  id: string;
  original_payment_id: string;
  adjustment_type: AdjustmentType;
  amount: string;
  reason: string;
  new_receipt_number: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  payment_id: string;
  member_id: string;
  membership_id: string;
  status: ReceiptStatus;
  cancelled_by_receipt_id: string | null;
  cancellation_reason: string | null;
  snapshot_data: ReceiptSnapshotData;
  issued_by: string | null;
  issued_at: string;
  cancelled_at: string | null;
}

export interface ReceiptSnapshotData {
  gym: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo_url: string | null;
    receipt_footer: string | null;
  };
  member: {
    full_name: string;
    member_code: string;
    phone: string;
  };
  membership: {
    plan_name: string;
    start_date: string;
    expiry_date: string;
    agreed_fee: string;
  };
  payment: {
    receipt_number: string;
    amount_charged: string;
    discount: string;
    amount_received: string;
    balance_due: string;
    payment_method: PaymentMethod;
    transaction_reference: string | null;
    payment_date: string;
    status: PaymentStatus;
  };
  issued_by_name: string | null;
  issued_at: string;
}

export interface GymSettings {
  id: string;
  gym_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string | null;
  currency: string;
  timezone: string;
  receipt_footer: string | null;
  receipt_number_prefix: string;
  partial_payments_enabled: boolean;
  social_links: Record<string, string> | null;
  operating_hours: string | null;
  tax_config: TaxConfig | null;
  updated_at: string;
}

export interface TaxConfig {
  enabled: boolean;
  gst_number?: string;
  gst_rate?: number;
  label?: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: AuditAction;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string | null;
  ip_address: string | null;
  performed_at: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  is_read: boolean;
  submitted_from: string | null;
  created_at: string;
}

// --- Form Types ---
export interface AddMemberFormData {
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  plan_id: string;
  start_date: string;
  expiry_date: string;
  record_payment: boolean;
  payment_data?: {
    amount_charged: string;
    discount: string;
    amount_received: string;
    payment_method: PaymentMethod;
    transaction_reference?: string;
    notes?: string;
  };
}

export interface RecordPaymentFormData {
  member_id: string;
  membership_id: string;
  amount_charged: string;
  discount: string;
  amount_received: string;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  payment_date: string;
  notes?: string;
}

export interface EnquiryFormData {
  name: string;
  phone: string;
  message: string;
  honeypot?: string; // must be empty
}

// --- API Response Types ---
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

// --- UI Types ---
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export type DatePreset = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
