// ============================================================================
// Add Member Page — Registration with membership assignment & optional first payment
// ============================================================================
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  HeartHandshake,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { MembershipPlan, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency } from '@/lib/money';
import { validatePhone, validateEmail } from '@/lib/validators';

export function AddMemberPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Membership Selection
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Recording
  const [recordPayment, setRecordPayment] = useState(true);
  const [agreedFee, setAgreedFee] = useState('');
  const [discount, setDiscount] = useState('0');
  const [amountReceived, setAmountReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionRef, setTransactionRef] = useState('');

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dataService.getActivePlans().then((p) => {
      setPlans(p);
      const firstPlan = p[0];
      if (firstPlan) {
        setSelectedPlanId(firstPlan.id);
        setAgreedFee(firstPlan.base_fee);
        setAmountReceived(firstPlan.base_fee);
      }
    });
  }, []);

  // Update agreed fee & amount received when plan changes
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setAgreedFee(plan.base_fee);
      setAmountReceived(plan.base_fee);
      setDiscount('0');
    }
  };

  // Check duplicate phone on blur
  const handlePhoneBlur = async () => {
    if (!phone) return;
    const { data } = await dataService.getMembers({ search: phone.trim() });
    const match = data.find((m) => m.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''));
    if (match) {
      setDuplicateWarning(
        `Notice: A member named "${match.full_name}" (${match.member_code}) is already registered with this phone number.`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  // Derived expiry date calculation
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const calculatedExpiryDate = () => {
    if (!selectedPlan || !startDate) return '-';
    const d = new Date(startDate);
    d.setDate(d.getDate() + selectedPlan.duration_days);
    return d.toISOString().split('T')[0];
  };

  // Derived balance calculation
  const balanceDue = () => {
    const fee = parseFloat(agreedFee) || 0;
    const disc = parseFloat(discount) || 0;
    const rec = parseFloat(amountReceived) || 0;
    return Math.max(0, fee - disc - rec).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!validatePhone(phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }

    if (email && !validateEmail(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (recordPayment) {
      if (!amountReceived || parseFloat(amountReceived) < 0) {
        errs.amountReceived = 'Please enter a valid amount';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const idempotency_key = `new_mem_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const result = await dataService.createMember({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        date_of_birth: dob || undefined,
        address: address.trim() || undefined,
        emergency_contact_name: emergencyName.trim() || undefined,
        emergency_contact_phone: emergencyPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        plan_id: selectedPlanId,
        start_date: startDate,
        agreed_fee: agreedFee,
        record_payment: recordPayment,
        payment_method: paymentMethod,
        amount_received: amountReceived,
        discount: discount,
        transaction_reference: transactionRef.trim() || undefined,
        idempotency_key,
      });

      // Redirect to Member Profile or Receipts
      navigate(`/admin/members/${result.member.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & title */}
      <div className="flex items-center gap-3">
        <Link to="/admin/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Add New Member</h1>
          <p className="text-sm text-text-secondary">
            Register a member, configure membership package, and issue their first payment receipt.
          </p>
        </div>
      </div>

      {duplicateWarning && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300">{duplicateWarning}</div>
        </div>
      )}

      {errors.form && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-300">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Personal Details */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 border-b border-gym-border pb-3">
            <User className="w-4 h-4 text-accent" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error={errors.fullName}
              required
            />

            <Input
              label="Phone Number *"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handlePhoneBlur}
              error={errors.phone}
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Date of Birth (Optional)"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <Input
            label="Address (Optional)"
            placeholder="Flat/Street, Area, City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* SECTION 2: Emergency Contact & Notes */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 border-b border-gym-border pb-3">
            <HeartHandshake className="w-4 h-4 text-accent" /> Emergency Contact & Health Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Emergency Contact Name"
              placeholder="Relative / Friend Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="Emergency Contact Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
          </div>

          <Textarea
            label="Medical / Fitness Notes (Optional)"
            placeholder="Any prior injuries, goals, or health precautions..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* SECTION 3: Membership Plan Selection */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 border-b border-gym-border pb-3">
            <CreditCard className="w-4 h-4 text-accent" /> Membership Package
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Select Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.duration_days} Days ({formatCurrency(p.base_fee)})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {selectedPlan && (
            <div className="p-3 bg-gym-card/60 rounded-lg border border-gym-border flex items-center justify-between text-xs text-text-secondary">
              <div>
                Duration: <span className="font-semibold text-text-primary">{selectedPlan.duration_days} days</span>
              </div>
              <div>
                Computed Expiry: <span className="font-semibold text-accent font-mono">{calculatedExpiryDate()}</span>
              </div>
              <div>
                Standard Fee: <span className="font-semibold text-text-primary">{formatCurrency(selectedPlan.base_fee)}</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: First Payment & Receipt */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gym-border pb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Receipt className="w-4 h-4 text-accent" /> First Payment & Receipt Generation
            </h2>
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={recordPayment}
                onChange={(e) => setRecordPayment(e.target.checked)}
                className="rounded border-gym-border text-accent focus:ring-accent"
              />
              Record payment now
            </label>
          </div>

          {recordPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Agreed Fee (₹) *"
                  type="number"
                  value={agreedFee}
                  onChange={(e) => setAgreedFee(e.target.value)}
                  required
                />

                <Input
                  label="Discount (₹)"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />

                <Input
                  label="Amount Received (₹) *"
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  error={errors.amountReceived}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card (POS / Debit / Credit)</option>
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  label="Transaction Ref / UTR / Note (Optional)"
                  placeholder="e.g. UPI Ref / Cash Bill #"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>

              {/* Dues Preview Pill */}
              <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg flex items-center justify-between text-xs">
                <span className="text-text-secondary">Balance Due calculated:</span>
                <span className="text-base font-bold font-mono text-accent">
                  {formatCurrency(balanceDue())}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/admin/members">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="gap-2 px-6">
            <CheckCircle className="w-4 h-4" />
            {loading ? 'Creating Member...' : 'Register Member'}
          </Button>
        </div>
      </form>
    </div>
  );
}
