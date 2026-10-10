// ============================================================================
// Dynamo Fitness Club — Comprehensive Data Access Service
// Supports Supabase with automatic local storage fallback & seeding
// ============================================================================
import type {
  Member,
  MemberWithStatus,
  MembershipPlan,
  PaymentWithDetails,
  Receipt,
  GymSettings,
  AuditLog,
  Enquiry,
  PaymentMethod,
} from '@/types';
import { formatCurrency } from '@/lib/money';

// Seed Initial Mock State
const INITIAL_SETTINGS: GymSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  gym_name: 'Dynamo Fitness Club',
  address: 'Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210',
  phone: '+91 98765 43210',
  email: 'info@dynamofitness.in',
  logo_url: null,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  receipt_footer: 'Thank you for choosing Dynamo Fitness Club! Stay fit, stay strong.',
  receipt_number_prefix: 'DFC',
  partial_payments_enabled: true,
  social_links: {
    instagram: 'dynamofitness_club',
    facebook: 'dynamofitnessclub',
    whatsapp: '+919876543210',
  },
  operating_hours: 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 6:00 AM - 12:00 PM',
  tax_config: { enabled: true, gst_number: '27AABCS1429B1Z8', gst_rate: 18, label: 'GST' },
  updated_at: new Date().toISOString(),
};

const INITIAL_PLANS: MembershipPlan[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: '1 Month Kickstart', duration_days: 30, base_fee: '1500.00', is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '22222222-2222-2222-2222-222222222222', name: '3 Months Muscle Builder', duration_days: 90, base_fee: '4000.00', is_active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '33333333-3333-3333-3333-333333333333', name: '6 Months Pro Fitness', duration_days: 180, base_fee: '7500.00', is_active: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '44444444-4444-4444-4444-444444444444', name: '12 Months Elite Annual', duration_days: 365, base_fee: '13500.00', is_active: true, sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const INITIAL_MEMBERS: MemberWithStatus[] = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    member_code: 'DFC-M-0001',
    full_name: 'Aarav Sharma',
    phone: '+91 98201 12345',
    email: 'aarav.sharma@example.com',
    date_of_birth: '1995-04-12',
    address: 'Flat 402, Seawood Towers, Kharghar',
    emergency_contact_name: 'Rohit Sharma',
    emergency_contact_phone: '+91 98201 54321',
    notes: 'Focus on strength training & hypertrophy',
    is_archived: false,
    created_by: null,
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
    computed_status: 'active',
    current_expiry_date: '2026-12-31',
    current_plan_name: '12 Months Elite Annual',
  },
  {
    id: 'a0000002-0000-0000-0000-000000000002',
    member_code: 'DFC-M-0002',
    full_name: 'Priya Deshmukh',
    phone: '+91 98202 23456',
    email: 'priya.d@example.com',
    date_of_birth: '1998-08-23',
    address: 'B-12, Green Acres, Vashi',
    emergency_contact_name: 'Sunil Deshmukh',
    emergency_contact_phone: '+91 98202 65432',
    notes: 'Weight loss and functional cardio',
    is_archived: false,
    created_by: null,
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
    computed_status: 'active',
    current_expiry_date: '2026-11-28',
    current_plan_name: '6 Months Pro Fitness',
  },
  {
    id: 'a0000003-0000-0000-0000-000000000003',
    member_code: 'DFC-M-0003',
    full_name: 'Rohan Patel',
    phone: '+91 98203 34567',
    email: 'rohan.patel@example.com',
    date_of_birth: '1992-11-05',
    address: 'Plot 55, Sector 20, Nerul',
    emergency_contact_name: 'Kavita Patel',
    emergency_contact_phone: '+91 98203 76543',
    notes: 'Rehabilitation precautions',
    is_archived: false,
    created_by: null,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T10:00:00Z',
    computed_status: 'active',
    current_expiry_date: '2026-11-30',
    current_plan_name: '3 Months Muscle Builder',
  },
  {
    id: 'a0000004-0000-0000-0000-000000000004',
    member_code: 'DFC-M-0004',
    full_name: 'Ananya Verma',
    phone: '+91 98204 45678',
    email: 'ananya.v@example.com',
    date_of_birth: '2001-02-18',
    address: 'Palm Beach Residency, Sanpada',
    emergency_contact_name: 'Manish Verma',
    emergency_contact_phone: '+91 98204 87654',
    notes: 'Evening slots preferred',
    is_archived: false,
    created_by: null,
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
    computed_status: 'active',
    current_expiry_date: '2026-10-31',
    current_plan_name: '1 Month Kickstart',
  },
  {
    id: 'a0000017-0000-0000-0000-000000000017',
    member_code: 'DFC-M-0017',
    full_name: 'Kunal Rane',
    phone: '+91 98217 78901',
    email: 'kunal.rane@example.com',
    date_of_birth: '1989-03-03',
    address: 'Sector 8, Nerul',
    emergency_contact_name: 'Archana Rane',
    emergency_contact_phone: '+91 98217 10987',
    notes: 'Expiring in 4 days alert',
    is_archived: false,
    created_by: null,
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:00:00Z',
    computed_status: 'active',
    current_expiry_date: '2026-10-15',
    current_plan_name: '1 Month Kickstart',
  },
  {
    id: 'a0000018-0000-0000-0000-000000000018',
    member_code: 'DFC-M-0018',
    full_name: 'Shruti Bose',
    phone: '+91 98218 89012',
    email: 'shruti.bose@example.com',
    date_of_birth: '1996-06-20',
    address: 'Sector 17, Vashi',
    emergency_contact_name: 'Subhash Bose',
    emergency_contact_phone: '+91 98218 21098',
    notes: 'Expired recently',
    is_archived: false,
    created_by: null,
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-07-01T10:00:00Z',
    computed_status: 'expired',
    current_expiry_date: '2026-09-29',
    current_plan_name: '3 Months Muscle Builder',
  },
  {
    id: 'a0000019-0000-0000-0000-000000000019',
    member_code: 'DFC-M-0019',
    full_name: 'Manish Tiwari',
    phone: '+91 98219 90123',
    email: 'manish.t@example.com',
    date_of_birth: '1985-05-05',
    address: 'Sector 19, Kharghar',
    emergency_contact_name: 'Geeta Tiwari',
    emergency_contact_phone: '+91 98219 32109',
    notes: 'Inactive membership profile',
    is_archived: false,
    created_by: null,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
    computed_status: 'inactive',
    current_expiry_date: null,
    current_plan_name: null,
  },
  {
    id: 'a0000020-0000-0000-0000-000000000020',
    member_code: 'DFC-M-0020',
    full_name: 'Arjun Saxena',
    phone: '+91 98220 01234',
    email: 'arjun.saxena@example.com',
    date_of_birth: '1994-12-12',
    address: 'Sector 11, Belapur',
    emergency_contact_name: 'Kavita Saxena',
    emergency_contact_phone: '+91 98220 43210',
    notes: 'Archived test record',
    is_archived: true,
    created_by: null,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z',
    computed_status: 'archived',
    current_expiry_date: '2026-01-01',
    current_plan_name: '1 Month Kickstart',
  },
];

const INITIAL_PAYMENTS: PaymentWithDetails[] = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    member_id: 'a0000001-0000-0000-0000-000000000001',
    membership_id: 'b0000001-0000-0000-0000-000000000001',
    receipt_number: 'DFC-2026-00001',
    amount_charged: '13500.00',
    discount: '500.00',
    amount_received: '13000.00',
    balance_due: '0.00',
    payment_method: 'upi',
    transaction_reference: 'UPI/PAYTM/6182749102',
    status: 'paid',
    payment_date: '2026-01-01T10:30:00Z',
    notes: 'Annual package offer discount applied',
    idempotency_key: 'idemp_seed_001',
    created_by: null,
    created_at: '2026-01-01T10:30:00Z',
    updated_at: '2026-01-01T10:30:00Z',
    member_name: 'Aarav Sharma',
    member_code: 'DFC-M-0001',
    member_phone: '+91 98201 12345',
    plan_name: '12 Months Elite Annual',
    membership_start: '2026-01-01',
    membership_expiry: '2026-12-31',
  },
  {
    id: 'c0000002-0000-0000-0000-000000000002',
    member_id: 'a0000002-0000-0000-0000-000000000002',
    membership_id: 'b0000002-0000-0000-0000-000000000002',
    receipt_number: 'DFC-2026-00002',
    amount_charged: '7500.00',
    discount: '0.00',
    amount_received: '5000.00',
    balance_due: '2500.00',
    payment_method: 'cash',
    transaction_reference: null,
    status: 'partial',
    payment_date: '2026-06-01T11:15:00Z',
    notes: 'First installment paid; remaining due in 15 days',
    idempotency_key: 'idemp_seed_002',
    created_by: null,
    created_at: '2026-06-01T11:15:00Z',
    updated_at: '2026-06-01T11:15:00Z',
    member_name: 'Priya Deshmukh',
    member_code: 'DFC-M-0002',
    member_phone: '+91 98202 23456',
    plan_name: '6 Months Pro Fitness',
    membership_start: '2026-06-01',
    membership_expiry: '2026-11-28',
  },
  {
    id: 'c0000003-0000-0000-0000-000000000003',
    member_id: 'a0000003-0000-0000-0000-000000000003',
    membership_id: 'b0000003-0000-0000-0000-000000000003',
    receipt_number: 'DFC-2026-00003',
    amount_charged: '4000.00',
    discount: '0.00',
    amount_received: '4000.00',
    balance_due: '0.00',
    payment_method: 'card',
    transaction_reference: 'POS/HDFC/9921',
    status: 'paid',
    payment_date: '2026-09-01T18:20:00Z',
    notes: 'Paid in full via POS swipe',
    idempotency_key: 'idemp_seed_003',
    created_by: null,
    created_at: '2026-09-01T18:20:00Z',
    updated_at: '2026-09-01T18:20:00Z',
    member_name: 'Rohan Patel',
    member_code: 'DFC-M-0003',
    member_phone: '+91 98203 34567',
    plan_name: '3 Months Muscle Builder',
    membership_start: '2026-09-01',
    membership_expiry: '2026-11-30',
  },
];

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'd0000001-0000-0000-0000-000000000001',
    receipt_number: 'DFC-2026-00001',
    payment_id: 'c0000001-0000-0000-0000-000000000001',
    member_id: 'a0000001-0000-0000-0000-000000000001',
    membership_id: 'b0000001-0000-0000-0000-000000000001',
    status: 'issued',
    cancelled_by_receipt_id: null,
    cancellation_reason: null,
    snapshot_data: {
      gym: {
        name: 'Dynamo Fitness Club',
        address: 'Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210',
        phone: '+91 98765 43210',
        email: 'info@dynamofitness.in',
        logo_url: null,
        receipt_footer: 'Thank you for training with Dynamo Fitness Club!',
      },
      member: {
        full_name: 'Aarav Sharma',
        member_code: 'DFC-M-0001',
        phone: '+91 98201 12345',
      },
      membership: {
        plan_name: '12 Months Elite Annual',
        start_date: '2026-01-01',
        expiry_date: '2026-12-31',
        agreed_fee: '13500.00',
      },
      payment: {
        receipt_number: 'DFC-2026-00001',
        amount_charged: '13500.00',
        discount: '500.00',
        amount_received: '13000.00',
        balance_due: '0.00',
        payment_method: 'upi',
        transaction_reference: 'UPI/PAYTM/6182749102',
        payment_date: '2026-01-01T10:30:00Z',
        status: 'paid',
      },
      issued_by_name: 'Admin',
      issued_at: '2026-01-01T10:30:00Z',
    },
    issued_by: null,
    issued_at: '2026-01-01T10:30:00Z',
    cancelled_at: null,
  },
  {
    id: 'd0000002-0000-0000-0000-000000000002',
    receipt_number: 'DFC-2026-00002',
    payment_id: 'c0000002-0000-0000-0000-000000000002',
    member_id: 'a0000002-0000-0000-0000-000000000002',
    membership_id: 'b0000002-0000-0000-0000-000000000002',
    status: 'issued',
    cancelled_by_receipt_id: null,
    cancellation_reason: null,
    snapshot_data: {
      gym: {
        name: 'Dynamo Fitness Club',
        address: 'Plot 42, Sector 18, Commercial Belt, Kharghar, Navi Mumbai - 410210',
        phone: '+91 98765 43210',
        email: 'info@dynamofitness.in',
        logo_url: null,
        receipt_footer: 'Thank you for training with Dynamo Fitness Club!',
      },
      member: {
        full_name: 'Priya Deshmukh',
        member_code: 'DFC-M-0002',
        phone: '+91 98202 23456',
      },
      membership: {
        plan_name: '6 Months Pro Fitness',
        start_date: '2026-06-01',
        expiry_date: '2026-11-28',
        agreed_fee: '7500.00',
      },
      payment: {
        receipt_number: 'DFC-2026-00002',
        amount_charged: '7500.00',
        discount: '0.00',
        amount_received: '5000.00',
        balance_due: '2500.00',
        payment_method: 'cash',
        transaction_reference: null,
        payment_date: '2026-06-01T11:15:00Z',
        status: 'partial',
      },
      issued_by_name: 'Admin',
      issued_at: '2026-06-01T11:15:00Z',
    },
    issued_by: null,
    issued_at: '2026-06-01T11:15:00Z',
    cancelled_at: null,
  },
];

const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'e0000001-0000-0000-0000-000000000001',
    name: 'Sameer Sen',
    phone: '+91 99112 23344',
    message: 'Interested in the 6-month muscle builder plan. Do you offer morning personal training?',
    is_read: false,
    submitted_from: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'e0000002-0000-0000-0000-000000000002',
    name: 'Ritu Mathur',
    phone: '+91 99223 34455',
    message: 'Looking for women-specific batch timings and certified trainer guidance.',
    is_read: true,
    submitted_from: null,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'f0000001-0000-0000-0000-000000000001',
    entity_type: 'member',
    entity_id: 'a0000001-0000-0000-0000-000000000001',
    action: 'create',
    old_data: null,
    new_data: { member_code: 'DFC-M-0001', full_name: 'Aarav Sharma' },
    performed_by: 'Gym Admin',
    ip_address: '127.0.0.1',
    performed_at: '2026-01-01T10:00:00Z',
  },
  {
    id: 'f0000002-0000-0000-0000-000000000002',
    entity_type: 'payment',
    entity_id: 'c0000001-0000-0000-0000-000000000001',
    action: 'create',
    old_data: null,
    new_data: { receipt_number: 'DFC-2026-00001', amount_received: '13000.00' },
    performed_by: 'Gym Admin',
    ip_address: '127.0.0.1',
    performed_at: '2026-01-01T10:30:00Z',
  },
];

function getStorage<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(`dfc_${key}`);
    return item ? (JSON.parse(item) as T) : initial;
  } catch {
    return initial;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`dfc_${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

export const dataService = {
  // --------------------------------------------------------------------------
  // MEMBERS
  // --------------------------------------------------------------------------
  async getMembers(params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: MemberWithStatus[]; count: number }> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const search = params?.search?.toLowerCase().trim() ?? '';
    const status = params?.status ?? 'all';

    let members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);

    if (search) {
      members = members.filter(
        (m) =>
          m.full_name.toLowerCase().includes(search) ||
          m.phone.includes(search) ||
          m.member_code.toLowerCase().includes(search) ||
          (m.email && m.email.toLowerCase().includes(search))
      );
    }

    if (status !== 'all') {
      members = members.filter((m) => m.computed_status === status);
    }

    const count = members.length;
    const start = (page - 1) * pageSize;
    const paginated = members.slice(start, start + pageSize);

    return { data: paginated, count };
  },

  async getMemberById(id: string): Promise<MemberWithStatus | null> {
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    return members.find((m) => m.id === id) ?? null;
  },

  async createMember(payload: {
    full_name: string;
    phone: string;
    email?: string;
    date_of_birth?: string;
    address?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
    plan_id?: string;
    start_date?: string;
    agreed_fee?: string;
    record_payment?: boolean;
    payment_method?: PaymentMethod;
    amount_received?: string;
    discount?: string;
    transaction_reference?: string;
    idempotency_key?: string;
  }): Promise<{ member: MemberWithStatus; receipt?: Receipt }> {
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const plans = getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
    const payments = getStorage<PaymentWithDetails[]>('payments', INITIAL_PAYMENTS);
    const receipts = getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
    const settings = getStorage<GymSettings>('settings', INITIAL_SETTINGS);

    const nextNum = members.length + 1;
    const member_code = `DFC-M-${String(nextNum).padStart(4, '0')}`;
    const member_id = `mem_${Date.now()}`;

    let computed_status: MemberWithStatus['computed_status'] = 'inactive';
    let current_plan_name: string | null = null;
    let current_expiry_date: string | null = null;

    let createdReceipt: Receipt | undefined;

    if (payload.plan_id) {
      const plan = plans.find((p) => p.id === payload.plan_id);
      if (plan) {
        current_plan_name = plan.name;
        const startDate = payload.start_date ? new Date(payload.start_date) : new Date();
        const expiryDate = new Date(startDate);
        expiryDate.setDate(expiryDate.getDate() + plan.duration_days);
        current_expiry_date = expiryDate.toISOString().split('T')[0] ?? null;
        computed_status = 'active';

        if (payload.record_payment && payload.amount_received) {
          const agreedFee = payload.agreed_fee || plan.base_fee;
          const discount = payload.discount || '0.00';
          const received = payload.amount_received || '0.00';
          const balanceDue = Math.max(0, parseFloat(agreedFee) - parseFloat(discount) - parseFloat(received)).toFixed(2);
          const paymentStatus = parseFloat(balanceDue) <= 0 ? 'paid' : 'partial';

          const receiptYear = new Date().getFullYear();
          const receiptNo = `${settings.receipt_number_prefix || 'DFC'}-${receiptYear}-${String(receipts.length + 1).padStart(5, '0')}`;
          const paymentId = `pay_${Date.now()}`;
          const membershipId = `ms_${Date.now()}`;

          const newPayment: PaymentWithDetails = {
            id: paymentId,
            member_id,
            membership_id: membershipId,
            receipt_number: receiptNo,
            amount_charged: agreedFee,
            discount,
            amount_received: received,
            balance_due: balanceDue,
            payment_method: payload.payment_method || 'cash',
            transaction_reference: payload.transaction_reference || null,
            status: paymentStatus,
            payment_date: new Date().toISOString(),
            notes: 'First payment at registration',
            idempotency_key: payload.idempotency_key || `idemp_${Date.now()}`,
            created_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            member_name: payload.full_name,
            member_code,
            member_phone: payload.phone,
            plan_name: plan.name,
            membership_start: payload.start_date || new Date().toISOString().split('T')[0] || '',
            membership_expiry: current_expiry_date || new Date().toISOString().split('T')[0] || '',
          };
          payments.unshift(newPayment);
          setStorage('payments', payments);

          createdReceipt = {
            id: `rec_${Date.now()}`,
            receipt_number: receiptNo,
            payment_id: paymentId,
            member_id,
            membership_id: membershipId,
            status: 'issued',
            cancelled_by_receipt_id: null,
            cancellation_reason: null,
            snapshot_data: {
              gym: {
                name: settings.gym_name,
                address: settings.address,
                phone: settings.phone,
                email: settings.email,
                logo_url: settings.logo_url,
                receipt_footer: settings.receipt_footer,
              },
              member: {
                full_name: payload.full_name,
                member_code,
                phone: payload.phone,
              },
              membership: {
                plan_name: plan.name,
                start_date: payload.start_date || new Date().toISOString().split('T')[0] || '',
                expiry_date: current_expiry_date || new Date().toISOString().split('T')[0] || '',
                agreed_fee: agreedFee,
              },
              payment: {
                receipt_number: receiptNo,
                amount_charged: agreedFee,
                discount,
                amount_received: received,
                balance_due: balanceDue,
                payment_method: payload.payment_method || 'cash',
                transaction_reference: payload.transaction_reference || null,
                payment_date: new Date().toISOString(),
                status: paymentStatus,
              },
              issued_by_name: 'Administrator',
              issued_at: new Date().toISOString(),
            },
            issued_by: null,
            issued_at: new Date().toISOString(),
            cancelled_at: null,
          };
          receipts.unshift(createdReceipt);
          setStorage('receipts', receipts);
        }
      }
    }

    const newMember: MemberWithStatus = {
      id: member_id,
      member_code,
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email || null,
      date_of_birth: payload.date_of_birth || null,
      address: payload.address || null,
      emergency_contact_name: payload.emergency_contact_name || null,
      emergency_contact_phone: payload.emergency_contact_phone || null,
      notes: payload.notes || null,
      is_archived: false,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      computed_status,
      current_expiry_date,
      current_plan_name,
    };

    members.unshift(newMember);
    setStorage('members', members);

    await this.addAuditLog('member', member_id, 'create', null, { member_code, name: payload.full_name });

    return { member: newMember, receipt: createdReceipt };
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<MemberWithStatus> {
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const current = members[index]!;
    const oldData = { ...current };
    const updated: MemberWithStatus = {
      ...current,
      ...updates,
      id: current.id,
      member_code: current.member_code,
      computed_status: current.computed_status,
      updated_at: new Date().toISOString(),
    };
    members[index] = updated;
    setStorage('members', members);

    await this.addAuditLog('member', id, 'update', oldData, updates as Record<string, unknown>);
    return updated;
  },

  async archiveMember(id: string): Promise<void> {
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const member = members.find((m) => m.id === id);
    if (member) {
      member.is_archived = true;
      member.computed_status = 'archived';
      member.updated_at = new Date().toISOString();
      setStorage('members', members);
      await this.addAuditLog('member', id, 'archive', null, { is_archived: true });
    }
  },

  async restoreMember(id: string): Promise<void> {
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const member = members.find((m) => m.id === id);
    if (member) {
      member.is_archived = false;
      member.computed_status = member.current_expiry_date ? 'active' : 'inactive';
      member.updated_at = new Date().toISOString();
      setStorage('members', members);
      await this.addAuditLog('member', id, 'restore', null, { is_archived: false });
    }
  },

  // --------------------------------------------------------------------------
  // PLANS
  // --------------------------------------------------------------------------
  async getPlans(): Promise<MembershipPlan[]> {
    return getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
  },

  async getActivePlans(): Promise<MembershipPlan[]> {
    const plans = getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
    return plans.filter((p) => p.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  async createPlan(plan: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MembershipPlan> {
    const plans = getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    plans.push(newPlan);
    setStorage('plans', plans);
    await this.addAuditLog('plan', newPlan.id, 'create', null, { ...newPlan });
    return newPlan;
  },

  async updatePlan(id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const plans = getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Plan not found');
    const existing = plans[idx]!;
    const updated: MembershipPlan = {
      ...existing,
      ...updates,
      id: existing.id,
      updated_at: new Date().toISOString(),
    };
    plans[idx] = updated;
    setStorage('plans', plans);
    await this.addAuditLog('plan', id, 'update', null, updates as Record<string, unknown>);
    return updated;
  },

  // --------------------------------------------------------------------------
  // PAYMENTS & RECEIPTS
  // --------------------------------------------------------------------------
  async getPayments(params?: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: PaymentWithDetails[]; count: number }> {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const search = params?.search?.toLowerCase().trim() ?? '';
    const status = params?.status ?? 'all';

    let payments = getStorage<PaymentWithDetails[]>('payments', INITIAL_PAYMENTS);

    if (search) {
      payments = payments.filter(
        (p) =>
          p.member_name.toLowerCase().includes(search) ||
          p.member_code.toLowerCase().includes(search) ||
          p.receipt_number.toLowerCase().includes(search)
      );
    }

    if (status !== 'all') {
      payments = payments.filter((p) => p.status === status);
    }

    const count = payments.length;
    const start = (page - 1) * pageSize;
    return { data: payments.slice(start, start + pageSize), count };
  },

  async recordPayment(payload: {
    member_id: string;
    membership_id: string;
    amount_charged: string;
    amount_received: string;
    discount?: string;
    payment_method: PaymentMethod;
    transaction_reference?: string;
    notes?: string;
    idempotency_key: string;
  }): Promise<{ payment: PaymentWithDetails; receipt: Receipt }> {
    const payments = getStorage<PaymentWithDetails[]>('payments', INITIAL_PAYMENTS);
    const receipts = getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const settings = getStorage<GymSettings>('settings', INITIAL_SETTINGS);

    const existing = payments.find((p) => p.idempotency_key === payload.idempotency_key);
    if (existing) {
      const existingReceipt = receipts.find((r) => r.payment_id === existing.id);
      if (existingReceipt) {
        return { payment: existing, receipt: existingReceipt };
      }
    }

    const member = members.find((m) => m.id === payload.member_id);
    if (!member) throw new Error('Member not found');

    const discount = payload.discount || '0.00';
    const charged = payload.amount_charged;
    const received = payload.amount_received;
    const balanceDue = Math.max(0, parseFloat(charged) - parseFloat(discount) - parseFloat(received)).toFixed(2);
    const status = parseFloat(balanceDue) <= 0 ? 'paid' : 'partial';

    const receiptYear = new Date().getFullYear();
    const receiptNo = `${settings.receipt_number_prefix || 'DFC'}-${receiptYear}-${String(receipts.length + 1).padStart(5, '0')}`;
    const paymentId = `pay_${Date.now()}`;

    const newPayment: PaymentWithDetails = {
      id: paymentId,
      member_id: payload.member_id,
      membership_id: payload.membership_id,
      receipt_number: receiptNo,
      amount_charged: charged,
      discount,
      amount_received: received,
      balance_due: balanceDue,
      payment_method: payload.payment_method,
      transaction_reference: payload.transaction_reference || null,
      status,
      payment_date: new Date().toISOString(),
      notes: payload.notes || null,
      idempotency_key: payload.idempotency_key,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      member_name: member.full_name,
      member_code: member.member_code,
      member_phone: member.phone,
      plan_name: member.current_plan_name || 'Standard Membership',
      membership_start: new Date().toISOString().split('T')[0] || '',
      membership_expiry: member.current_expiry_date || new Date().toISOString().split('T')[0] || '',
    };

    payments.unshift(newPayment);
    setStorage('payments', payments);

    const newReceipt: Receipt = {
      id: `rec_${Date.now()}`,
      receipt_number: receiptNo,
      payment_id: paymentId,
      member_id: payload.member_id,
      membership_id: payload.membership_id,
      status: 'issued',
      cancelled_by_receipt_id: null,
      cancellation_reason: null,
      snapshot_data: {
        gym: {
          name: settings.gym_name,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          logo_url: settings.logo_url,
          receipt_footer: settings.receipt_footer,
        },
        member: {
          full_name: member.full_name,
          member_code: member.member_code,
          phone: member.phone,
        },
        membership: {
          plan_name: member.current_plan_name || 'Membership',
          start_date: new Date().toISOString().split('T')[0] || '',
          expiry_date: member.current_expiry_date || new Date().toISOString().split('T')[0] || '',
          agreed_fee: charged,
        },
        payment: {
          receipt_number: receiptNo,
          amount_charged: charged,
          discount,
          amount_received: received,
          balance_due: balanceDue,
          payment_method: payload.payment_method,
          transaction_reference: payload.transaction_reference || null,
          payment_date: new Date().toISOString(),
          status,
        },
        issued_by_name: 'Administrator',
        issued_at: new Date().toISOString(),
      },
      issued_by: null,
      issued_at: new Date().toISOString(),
      cancelled_at: null,
    };

    receipts.unshift(newReceipt);
    setStorage('receipts', receipts);

    await this.addAuditLog('payment', paymentId, 'create', null, { receipt_number: receiptNo, received });

    return { payment: newPayment, receipt: newReceipt };
  },

  async getReceipts(): Promise<Receipt[]> {
    return getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
  },

  async getReceiptById(id: string): Promise<Receipt | null> {
    const receipts = getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
    return receipts.find((r) => r.id === id || r.receipt_number === id) ?? null;
  },

  async cancelAndReissueReceipt(
    receiptId: string,
    reason: string,
    reissue = false
  ): Promise<{ cancelled: Receipt; reissued?: Receipt }> {
    const receipts = getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
    const idx = receipts.findIndex((r) => r.id === receiptId);
    if (idx === -1) throw new Error('Receipt not found');

    const target = receipts[idx]!;
    target.status = 'cancelled';
    target.cancellation_reason = reason;
    target.cancelled_at = new Date().toISOString();

    let reissuedReceipt: Receipt | undefined;

    if (reissue) {
      const settings = getStorage<GymSettings>('settings', INITIAL_SETTINGS);
      const receiptYear = new Date().getFullYear();
      const newReceiptNo = `${settings.receipt_number_prefix || 'DFC'}-${receiptYear}-${String(receipts.length + 1).padStart(5, '0')}`;

      reissuedReceipt = {
        ...target,
        id: `rec_${Date.now()}`,
        receipt_number: newReceiptNo,
        payment_id: target.payment_id,
        member_id: target.member_id,
        membership_id: target.membership_id,
        status: 'reissued',
        cancelled_by_receipt_id: target.id,
        cancellation_reason: `Reissued due to: ${reason}`,
        snapshot_data: {
          ...target.snapshot_data,
          payment: {
            ...target.snapshot_data.payment,
            receipt_number: newReceiptNo,
          },
          issued_at: new Date().toISOString(),
        },
        issued_at: new Date().toISOString(),
        cancelled_at: null,
      };

      target.cancelled_by_receipt_id = reissuedReceipt.id;
      receipts.unshift(reissuedReceipt);
    }

    setStorage('receipts', receipts);
    await this.addAuditLog('receipt', receiptId, 'cancel', null, { reason, reissued: reissue });

    return { cancelled: target, reissued: reissuedReceipt };
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  async getGymSettings(): Promise<GymSettings> {
    return getStorage<GymSettings>('settings', INITIAL_SETTINGS);
  },

  async updateGymSettings(updates: Partial<GymSettings>): Promise<GymSettings> {
    const settings = getStorage<GymSettings>('settings', INITIAL_SETTINGS);
    const updated: GymSettings = { ...settings, ...updates, updated_at: new Date().toISOString() };
    setStorage('settings', updated);
    await this.addAuditLog('settings', settings.id, 'update', null, updates as Record<string, unknown>);
    return updated;
  },

  // --------------------------------------------------------------------------
  // ENQUIRIES
  // --------------------------------------------------------------------------
  async getEnquiries(): Promise<Enquiry[]> {
    return getStorage<Enquiry[]>('enquiries', INITIAL_ENQUIRIES);
  },

  async submitEnquiry(payload: { name: string; phone: string; message?: string; honeypot?: string }): Promise<void> {
    if (payload.honeypot && payload.honeypot.trim() !== '') {
      return;
    }

    const enquiries = getStorage<Enquiry[]>('enquiries', INITIAL_ENQUIRIES);
    const newEnquiry: Enquiry = {
      id: `enq_${Date.now()}`,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      message: payload.message?.trim() || null,
      is_read: false,
      submitted_from: null,
      created_at: new Date().toISOString(),
    };
    enquiries.unshift(newEnquiry);
    setStorage('enquiries', enquiries);
  },

  async markEnquiryRead(id: string): Promise<void> {
    const enquiries = getStorage<Enquiry[]>('enquiries', INITIAL_ENQUIRIES);
    const enq = enquiries.find((e) => e.id === id);
    if (enq) {
      enq.is_read = true;
      setStorage('enquiries', enquiries);
    }
  },

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------
  async getAuditLogs(): Promise<AuditLog[]> {
    return getStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  },

  async addAuditLog(
    entity_type: string,
    entity_id: string | null,
    action: AuditLog['action'],
    old_data: Record<string, unknown> | null,
    new_data: Record<string, unknown> | null
  ): Promise<void> {
    const logs = getStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
    logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      entity_type,
      entity_id,
      action,
      old_data,
      new_data,
      performed_by: 'Gym Administrator',
      ip_address: '127.0.0.1',
      performed_at: new Date().toISOString(),
    });
    setStorage('audit_logs', logs);
  },

  // --------------------------------------------------------------------------
  // DASHBOARD KPI & SUMMARY
  // --------------------------------------------------------------------------
  async getDashboardSummary() {
    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const payments = getStorage<PaymentWithDetails[]>('payments', INITIAL_PAYMENTS);
    const enquiries = getStorage<Enquiry[]>('enquiries', INITIAL_ENQUIRIES);

    const activeMembers = members.filter((m) => m.computed_status === 'active' && !m.is_archived).length;
    const expiredMembers = members.filter((m) => m.computed_status === 'expired' && !m.is_archived).length;
    
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    const expiringSoon = members.filter((m) => {
      if (!m.current_expiry_date || m.is_archived) return false;
      const expiry = new Date(m.current_expiry_date);
      return expiry >= now && expiry <= in7Days;
    });

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenue = payments
      .filter((p) => {
        const d = new Date(p.payment_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + parseFloat(p.amount_received || '0'), 0);

    const unreadEnquiries = enquiries.filter((e) => !e.is_read).length;

    return {
      totalMembers: members.filter((m) => !m.is_archived).length,
      activeMembers,
      expiredMembers,
      expiringSoonCount: expiringSoon.length,
      expiringSoonMembers: expiringSoon,
      monthlyRevenueFormatted: formatCurrency(monthlyRevenue.toFixed(2)),
      monthlyRevenue,
      unreadEnquiries,
      recentPayments: payments.slice(0, 5),
    };
  },
};
