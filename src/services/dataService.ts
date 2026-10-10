// ============================================================================
// Dynamo Fitness Club — Comprehensive Data Access Service
// Seamlessly connects with Supabase with resilient fallback & seeding
// ============================================================================
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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

// Seed Initial Mock State (Used in Demo Mode or when tables are bootstrapping)
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
    current_expiry_date: '2026-10-15',
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
    notes: 'Annual upfront payment with early bird discount',
    idempotency_key: 'idemp_0001',
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
    // Ignore quota errors
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
    const start = (page - 1) * pageSize;

    // 1. Live Supabase Query
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('members_with_status').select('*', { count: 'exact' });

        if (search) {
          query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,member_code.ilike.%${search}%`);
        }

        if (status !== 'all') {
          query = query.eq('computed_status', status);
        }

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(start, start + pageSize - 1);

        if (!error && data) {
          return {
            data: data as MemberWithStatus[],
            count: count ?? data.length,
          };
        }
      } catch (err) {
        console.warn('Supabase getMembers fallback to local storage:', err);
      }
    }

    // 2. Resilient Local Storage Fallback
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
    const paginated = members.slice(start, start + pageSize);

    return { data: paginated, count };
  },

  async getMemberById(id: string): Promise<MemberWithStatus | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('members_with_status')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return data as MemberWithStatus;
        }
      } catch (err) {
        console.warn('Supabase getMemberById fallback:', err);
      }
    }

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
    // 1. Live Supabase RPC Execution
    if (isSupabaseConfigured) {
      try {
        const { data: rpcRes, error } = await supabase.rpc('register_member_with_membership', {
          p_full_name: payload.full_name,
          p_phone: payload.phone,
          p_email: payload.email || null,
          p_date_of_birth: payload.date_of_birth || null,
          p_address: payload.address || null,
          p_emergency_contact_name: payload.emergency_contact_name || null,
          p_emergency_contact_phone: payload.emergency_contact_phone || null,
          p_notes: payload.notes || null,
          p_plan_id: payload.plan_id || null,
          p_start_date: payload.start_date || new Date().toISOString().split('T')[0],
          p_agreed_fee: payload.agreed_fee ? parseFloat(payload.agreed_fee) : null,
          p_payment_method: payload.record_payment ? payload.payment_method || 'cash' : null,
          p_amount_received: payload.record_payment && payload.amount_received ? parseFloat(payload.amount_received) : null,
          p_discount: payload.discount ? parseFloat(payload.discount) : 0,
          p_transaction_reference: payload.transaction_reference || null,
          p_idempotency_key: payload.idempotency_key || `reg_${Date.now()}`,
        });

        if (!error && rpcRes) {
          const memberId = (rpcRes as { member_id: string }).member_id;
          const member = await this.getMemberById(memberId);
          let receipt: Receipt | undefined;
          const receiptId = (rpcRes as { receipt_id?: string }).receipt_id;
          if (receiptId) {
            receipt = (await this.getReceiptById(receiptId)) ?? undefined;
          }
          if (member) {
            return { member, receipt };
          }
        } else if (error) {
          console.warn('Supabase register_member_with_membership error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase createMember fallback:', err);
      }
    }

    // 2. Resilient Fallback Simulation
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

    return { member: newMember, receipt: createdReceipt };
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<MemberWithStatus> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('members')
          .update(updates)
          .eq('id', id);

        if (!error) {
          const fresh = await this.getMemberById(id);
          if (fresh) return fresh;
        }
      } catch (err) {
        console.warn('Supabase updateMember fallback:', err);
      }
    }

    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const current = members[index]!;
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
    return updated;
  },

  async archiveMember(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('members').update({ is_archived: true }).eq('id', id);
      } catch (err) {
        console.warn('Supabase archiveMember fallback:', err);
      }
    }

    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const member = members.find((m) => m.id === id);
    if (member) {
      member.is_archived = true;
      member.computed_status = 'archived';
      member.updated_at = new Date().toISOString();
      setStorage('members', members);
    }
  },

  async restoreMember(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('members').update({ is_archived: false }).eq('id', id);
      } catch (err) {
        console.warn('Supabase restoreMember fallback:', err);
      }
    }

    const members = getStorage<MemberWithStatus[]>('members', INITIAL_MEMBERS);
    const member = members.find((m) => m.id === id);
    if (member) {
      member.is_archived = false;
      member.computed_status = member.current_expiry_date ? 'active' : 'inactive';
      member.updated_at = new Date().toISOString();
      setStorage('members', members);
    }
  },

  // --------------------------------------------------------------------------
  // MEMBERSHIP RENEWALS
  // --------------------------------------------------------------------------
  async renewMembership(payload: {
    member_id: string;
    plan_id: string;
    start_date: string;
    agreed_fee: string;
    amount_received: string;
    discount?: string;
    payment_method: PaymentMethod;
    notes?: string;
    idempotency_key: string;
  }): Promise<{ receipt?: Receipt }> {
    if (isSupabaseConfigured) {
      try {
        const plans = await this.getPlans();
        const plan = plans.find((p) => p.id === payload.plan_id);
        if (plan) {
          const startDateObj = new Date(payload.start_date);
          const expiryDateObj = new Date(startDateObj);
          expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);
          const expiry_date = expiryDateObj.toISOString().split('T')[0];

          // 1. Insert new membership record
          const { data: ms, error: msError } = await supabase
            .from('memberships')
            .insert({
              member_id: payload.member_id,
              plan_id: payload.plan_id,
              start_date: payload.start_date,
              expiry_date,
              agreed_fee: parseFloat(payload.agreed_fee),
              plan_name_snapshot: plan.name,
              status: 'active',
              notes: payload.notes || `Renewed: ${plan.name}`,
            })
            .select()
            .single();

          if (!msError && ms) {
            // 2. Record payment & issue official receipt
            const { data: rpcRes, error: rpcError } = await supabase.rpc('record_payment_and_issue_receipt', {
              p_member_id: payload.member_id,
              p_membership_id: ms.id,
              p_amount_charged: parseFloat(payload.agreed_fee),
              p_amount_received: parseFloat(payload.amount_received),
              p_discount: payload.discount ? parseFloat(payload.discount) : 0,
              p_payment_method: payload.payment_method,
              p_transaction_reference: null,
              p_notes: `Renewal: ${plan.name}`,
              p_idempotency_key: payload.idempotency_key,
            });

            if (!rpcError && rpcRes) {
              const receiptId = (rpcRes as { receipt_id: string }).receipt_id;
              const receipt = await this.getReceiptById(receiptId);
              return { receipt: receipt ?? undefined };
            }
          }
        }
      } catch (err) {
        console.warn('Supabase renewMembership fallback:', err);
      }
    }

    // Fallback simulation
    const res = await this.recordPayment({
      member_id: payload.member_id,
      membership_id: `ms_${Date.now()}`,
      amount_charged: payload.agreed_fee,
      amount_received: payload.amount_received,
      discount: payload.discount,
      payment_method: payload.payment_method,
      notes: payload.notes,
      idempotency_key: payload.idempotency_key,
    });
    return { receipt: res.receipt };
  },

  // --------------------------------------------------------------------------
  // PLANS
  // --------------------------------------------------------------------------
  async getPlans(): Promise<MembershipPlan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as MembershipPlan[];
        }
      } catch (err) {
        console.warn('Supabase getPlans fallback:', err);
      }
    }

    return getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
  },

  async getActivePlans(): Promise<MembershipPlan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data as MembershipPlan[];
        }
      } catch (err) {
        console.warn('Supabase getActivePlans fallback:', err);
      }
    }

    const plans = getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
    return plans.filter((p) => p.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },

  async createPlan(plan: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MembershipPlan> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .insert(plan)
          .select()
          .single();

        if (!error && data) {
          return data as MembershipPlan;
        }
      } catch (err) {
        console.warn('Supabase createPlan fallback:', err);
      }
    }

    const plans = getStorage<MembershipPlan[]>('plans', INITIAL_PLANS);
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    plans.push(newPlan);
    setStorage('plans', plans);
    return newPlan;
  },

  async updatePlan(id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return data as MembershipPlan;
        }
      } catch (err) {
        console.warn('Supabase updatePlan fallback:', err);
      }
    }

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
    const start = (page - 1) * pageSize;

    if (isSupabaseConfigured) {
      try {
        const { data, count, error } = await supabase
          .from('payments')
          .select(`
            *,
            members:member_id (
              full_name,
              member_code,
              phone
            ),
            memberships:membership_id (
              plan_name_snapshot,
              start_date,
              expiry_date
            )
          `, { count: 'exact' })
          .order('payment_date', { ascending: false });

        if (!error && data) {
          interface PaymentRow {
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
            status: 'paid' | 'partial';
            payment_date: string;
            notes: string | null;
            idempotency_key: string | null;
            created_by: string | null;
            created_at: string;
            updated_at: string;
            members?: { full_name?: string; member_code?: string; phone?: string } | null;
            memberships?: { plan_name_snapshot?: string; start_date?: string; expiry_date?: string } | null;
          }

          const mapped: PaymentWithDetails[] = (data as unknown as PaymentRow[]).map((p) => ({
            id: p.id,
            member_id: p.member_id,
            membership_id: p.membership_id,
            receipt_number: p.receipt_number,
            amount_charged: String(p.amount_charged),
            discount: String(p.discount || '0.00'),
            amount_received: String(p.amount_received),
            balance_due: String(p.balance_due || '0.00'),
            payment_method: p.payment_method,
            transaction_reference: p.transaction_reference,
            status: p.status,
            payment_date: p.payment_date,
            notes: p.notes,
            idempotency_key: p.idempotency_key || `idemp_${p.id}`,
            created_by: p.created_by,
            created_at: p.created_at,
            updated_at: p.updated_at,
            member_name: p.members?.full_name || 'Member',
            member_code: p.members?.member_code || 'DFC-M-0000',
            member_phone: p.members?.phone || '',
            plan_name: p.memberships?.plan_name_snapshot || 'Membership Plan',
            membership_start: p.memberships?.start_date || '',
            membership_expiry: p.memberships?.expiry_date || '',
          }));

          let filtered = mapped;
          if (search) {
            filtered = filtered.filter(
              (p) =>
                p.member_name.toLowerCase().includes(search) ||
                p.member_code.toLowerCase().includes(search) ||
                p.receipt_number.toLowerCase().includes(search)
            );
          }
          if (status !== 'all') {
            filtered = filtered.filter((p) => p.status === status);
          }

          const total = count ?? filtered.length;
          return { data: filtered.slice(start, start + pageSize), count: total };
        }
      } catch (err) {
        console.warn('Supabase getPayments fallback:', err);
      }
    }

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
    if (isSupabaseConfigured) {
      try {
        let validMembershipId = payload.membership_id;
        if (!validMembershipId || validMembershipId.startsWith('ms_')) {
          const { data: ms } = await supabase
            .from('memberships')
            .select('id')
            .eq('member_id', payload.member_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (ms) {
            validMembershipId = (ms as { id: string }).id;
          }
        }

        if (validMembershipId && !validMembershipId.startsWith('ms_')) {
          const { data: rpcRes, error } = await supabase.rpc('record_payment_and_issue_receipt', {
            p_member_id: payload.member_id,
            p_membership_id: validMembershipId,
            p_amount_charged: parseFloat(payload.amount_charged),
            p_amount_received: parseFloat(payload.amount_received),
            p_discount: payload.discount ? parseFloat(payload.discount) : 0,
            p_payment_method: payload.payment_method,
            p_transaction_reference: payload.transaction_reference || null,
            p_notes: payload.notes || null,
            p_idempotency_key: payload.idempotency_key,
          });

          if (!error && rpcRes) {
            const receiptId = (rpcRes as { receipt_id: string }).receipt_id;
            const paymentId = (rpcRes as { payment_id: string }).payment_id;
            const receipt = await this.getReceiptById(receiptId);
            const payments = await this.getPayments();
            const p = payments.data.find((x) => x.id === paymentId) || payments.data[0];
            if (p && receipt) {
              return { payment: p, receipt };
            }
          }
        }
      } catch (err) {
        console.warn('Supabase recordPayment fallback:', err);
      }
    }

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

    return { payment: newPayment, receipt: newReceipt };
  },

  async getReceipts(): Promise<Receipt[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .order('issued_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Receipt[];
        }
      } catch (err) {
        console.warn('Supabase getReceipts fallback:', err);
      }
    }

    return getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
  },

  async getReceiptById(id: string): Promise<Receipt | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .or(`id.eq.${id},receipt_number.eq.${id}`)
          .maybeSingle();

        if (!error && data) {
          return data as Receipt;
        }
      } catch (err) {
        console.warn('Supabase getReceiptById fallback:', err);
      }
    }

    const receipts = getStorage<Receipt[]>('receipts', INITIAL_RECEIPTS);
    return receipts.find((r) => r.id === id || r.receipt_number === id) ?? null;
  },

  async cancelAndReissueReceipt(
    receiptId: string,
    reason: string,
    reissue = false
  ): Promise<{ cancelled: Receipt; reissued?: Receipt }> {
    if (isSupabaseConfigured) {
      try {
        const { data: rpcRes, error } = await supabase.rpc('cancel_and_reissue_receipt', {
          p_receipt_id: receiptId,
          p_reason: reason,
          p_reissue: reissue,
        });

        if (!error && rpcRes) {
          const cancelled = await this.getReceiptById(receiptId);
          let reissued: Receipt | undefined;
          const newReceiptId = (rpcRes as { new_receipt_id?: string }).new_receipt_id;
          if (newReceiptId) {
            reissued = (await this.getReceiptById(newReceiptId)) ?? undefined;
          }
          if (cancelled) {
            return { cancelled, reissued };
          }
        }
      } catch (err) {
        console.warn('Supabase cancelAndReissueReceipt fallback:', err);
      }
    }

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
    return { cancelled: target, reissued: reissuedReceipt };
  },

  // --------------------------------------------------------------------------
  // SETTINGS
  // --------------------------------------------------------------------------
  async getGymSettings(): Promise<GymSettings> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('gym_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return data as GymSettings;
        }
      } catch (err) {
        console.warn('Supabase getGymSettings fallback:', err);
      }
    }

    return getStorage<GymSettings>('settings', INITIAL_SETTINGS);
  },

  async updateGymSettings(updates: Partial<GymSettings>): Promise<GymSettings> {
    if (isSupabaseConfigured) {
      try {
        const current = await this.getGymSettings();
        const { data, error } = await supabase
          .from('gym_settings')
          .update(updates)
          .eq('id', current.id)
          .select()
          .single();

        if (!error && data) {
          return data as GymSettings;
        }
      } catch (err) {
        console.warn('Supabase updateGymSettings fallback:', err);
      }
    }

    const settings = getStorage<GymSettings>('settings', INITIAL_SETTINGS);
    const updated: GymSettings = { ...settings, ...updates, updated_at: new Date().toISOString() };
    setStorage('settings', updated);
    return updated;
  },

  // --------------------------------------------------------------------------
  // ENQUIRIES
  // --------------------------------------------------------------------------
  async getEnquiries(): Promise<Enquiry[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data as Enquiry[];
        }
      } catch (err) {
        console.warn('Supabase getEnquiries fallback:', err);
      }
    }

    return getStorage<Enquiry[]>('enquiries', INITIAL_ENQUIRIES);
  },

  async submitEnquiry(payload: { name: string; phone: string; message?: string; honeypot?: string }): Promise<void> {
    if (payload.honeypot && payload.honeypot.trim() !== '') {
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('enquiries').insert({
          name: payload.name.trim(),
          phone: payload.phone.trim(),
          message: payload.message?.trim() || null,
        });

        if (!error) return;
      } catch (err) {
        console.warn('Supabase submitEnquiry fallback:', err);
      }
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
    if (isSupabaseConfigured) {
      try {
        await supabase.from('enquiries').update({ is_read: true }).eq('id', id);
      } catch (err) {
        console.warn('Supabase markEnquiryRead fallback:', err);
      }
    }

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
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('performed_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          return data as AuditLog[];
        }
      } catch (err) {
        console.warn('Supabase getAuditLogs fallback:', err);
      }
    }

    return getStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS);
  },

  // --------------------------------------------------------------------------
  // DASHBOARD KPI & SUMMARY
  // --------------------------------------------------------------------------
  async getDashboardSummary() {
    const { data: members } = await this.getMembers({ pageSize: 500 });
    const { data: payments } = await this.getPayments({ pageSize: 500 });
    const enquiries = await this.getEnquiries();

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
