// ============================================================================
// Validation Schemas — Zod schemas for all forms
// ============================================================================
import { z } from 'zod';

// Indian phone: 10 digits, optionally prefixed with +91 or 91
const indianPhoneRegex = /^(\+?91[-\s]?)?[6-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(indianPhoneRegex, 'Enter a valid 10-digit Indian phone number');

export function validatePhone(phone: string): boolean {
  return indianPhoneRegex.test(phone.replace(/[\s-]/g, ''));
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const emailSchema = z
  .string()
  .email('Enter a valid email address')
  .optional()
  .or(z.literal(''));

export const moneySchema = z
  .string()
  .min(1, 'Amount is required')
  .refine((v) => {
    const num = parseFloat(v.replace(/,/g, ''));
    return !isNaN(num) && num >= 0;
  }, 'Enter a valid amount (≥ 0)');

export const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date');

// --- Login Form ---
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// --- Forgot Password ---
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// --- Reset Password ---
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// --- Add Member ---
export const addMemberSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: phoneSchema,
  email: emailSchema,
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional().refine(
    (v) => !v || indianPhoneRegex.test(v),
    'Enter a valid phone number'
  ),
  notes: z.string().optional(),
  plan_id: z.string().min(1, 'Select a membership plan'),
  start_date: dateSchema,
  expiry_date: dateSchema,
  record_payment: z.boolean().default(false),
  payment_data: z.object({
    amount_charged: moneySchema,
    discount: z.string().default('0'),
    amount_received: moneySchema,
    payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']),
    transaction_reference: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
}).refine(
  (data) => !data.expiry_date || !data.start_date || data.expiry_date >= data.start_date,
  { message: 'Expiry date must be on or after start date', path: ['expiry_date'] }
);
export type AddMemberFormValues = z.infer<typeof addMemberSchema>;

// --- Record Payment ---
export const recordPaymentSchema = z.object({
  member_id: z.string().min(1, 'Select a member'),
  membership_id: z.string().min(1, 'Select a membership'),
  amount_charged: moneySchema,
  discount: z.string().default('0'),
  amount_received: moneySchema,
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'card', 'other']),
  transaction_reference: z.string().optional(),
  payment_date: z.string().min(1, 'Payment date is required'),
  notes: z.string().optional(),
});
export type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;

// --- Enquiry Form ---
export const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: phoneSchema,
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  honeypot: z.string().max(0, 'Bot detected').optional(),
});
export type EnquiryFormValues = z.infer<typeof enquirySchema>;

// --- Membership Plan ---
export const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required').max(100),
  duration_days: z.coerce.number().int().positive('Duration must be positive'),
  base_fee: moneySchema,
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().optional(),
});
export type PlanFormValues = z.infer<typeof planSchema>;

// --- Gym Settings ---
export const gymSettingsSchema = z.object({
  gym_name: z.string().min(1, 'Gym name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: emailSchema,
  receipt_footer: z.string().optional(),
  receipt_number_prefix: z.string().min(1).max(10).default('DFC'),
  partial_payments_enabled: z.boolean().default(true),
  operating_hours: z.string().optional(),
});
export type GymSettingsFormValues = z.infer<typeof gymSettingsSchema>;
