// ============================================================================
// Member Profile Page — Detailed Athlete Dashboard, History, Renewal & Receipts
// ============================================================================
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt as ReceiptIcon,
  MessageCircle,
  Archive,
  RotateCcw,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { MemberWithStatus, PaymentWithDetails, MembershipPlan, PaymentMethod } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/money';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [member, setMember] = useState<MemberWithStatus | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Renewal Modal
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [renewStartDate, setRenewStartDate] = useState('');
  const [renewAgreedFee, setRenewAgreedFee] = useState('');
  const [renewAmountReceived, setRenewAmountReceived] = useState('');
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<PaymentMethod>('upi');
  const [renewDiscount, setRenewDiscount] = useState('0');
  const [renewLoading, setRenewLoading] = useState(false);

  // Archive Confirm
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const fetchMemberData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const m = await dataService.getMemberById(id);
      setMember(m);

      const allPayments = await dataService.getPayments();
      const memberPayments = allPayments.data.filter((p) => p.member_id === id);
      setPayments(memberPayments);

      const allPlans = await dataService.getActivePlans();
      setPlans(allPlans);
      const firstPlan = allPlans[0];
      if (firstPlan) {
        setSelectedPlanId(firstPlan.id);
        setRenewAgreedFee(firstPlan.base_fee);
        setRenewAmountReceived(firstPlan.base_fee);
      }

      // Pre-fill renewal start date
      if (m?.current_expiry_date) {
        const nextDay = new Date(m.current_expiry_date);
        nextDay.setDate(nextDay.getDate() + 1);
        setRenewStartDate(nextDay.toISOString().split('T')[0] ?? '');
      } else {
        setRenewStartDate(new Date().toISOString().split('T')[0] ?? '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const handlePlanSelect = (pId: string) => {
    setSelectedPlanId(pId);
    const p = plans.find((x) => x.id === pId);
    if (p) {
      setRenewAgreedFee(p.base_fee);
      setRenewAmountReceived(p.base_fee);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setRenewLoading(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlanId);
      if (!plan) return;

      const startDateObj = new Date(renewStartDate);
      const expiryDateObj = new Date(startDateObj);
      expiryDateObj.setDate(expiryDateObj.getDate() + plan.duration_days);

      // Record payment & receipt
      const idempotency_key = `renew_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await dataService.recordPayment({
        member_id: member.id,
        membership_id: `ms_${Date.now()}`,
        amount_charged: renewAgreedFee,
        amount_received: renewAmountReceived,
        discount: renewDiscount,
        payment_method: renewPaymentMethod,
        notes: `Renewal: ${plan.name}`,
        idempotency_key,
      });

      // Update member expiry and status
      await dataService.updateMember(member.id, {
        notes: member.notes ? `${member.notes} | Renewed on ${new Date().toISOString().split('T')[0]}` : null,
      });

      setRenewModalOpen(false);
      fetchMemberData();
    } finally {
      setRenewLoading(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!member) return;
    if (member.is_archived) {
      await dataService.restoreMember(member.id);
    } else {
      await dataService.archiveMember(member.id);
    }
    setArchiveConfirmOpen(false);
    fetchMemberData();
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading athlete profile...</div>;
  }

  if (!member) {
    return (
      <div className="p-12 text-center bg-gym-surface border border-gym-border rounded-xl">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-text-primary">Member not found</h2>
        <Link to="/admin/members" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            &larr; Back to Member List
          </Button>
        </Link>
      </div>
    );
  }

  // Days remaining calculation
  const getDaysRemaining = () => {
    if (!member.current_expiry_date) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(member.current_expiry_date);
    exp.setHours(0, 0, 0, 0);
    const diffTime = exp.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/admin/members">
          <Button variant="ghost" size="sm" className="gap-2 text-text-secondary">
            <ArrowLeft className="w-4 h-4" /> Back to Members
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {member.phone && (
            <a
              href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${member.full_name}, this is Dynamo Fitness Club.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2 text-emerald-400 border-emerald-500/30">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            className={member.is_archived ? 'text-emerald-400' : 'text-rose-400'}
            onClick={() => setArchiveConfirmOpen(true)}
          >
            {member.is_archived ? <RotateCcw className="w-4 h-4 mr-1" /> : <Archive className="w-4 h-4 mr-1" />}
            {member.is_archived ? 'Restore' : 'Archive'}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setRenewModalOpen(true)}>
            <PlusCircle className="w-4 h-4" /> Renew Membership
          </Button>
        </div>
      </div>

      {/* Athlete Header Card */}
      <div className="p-6 bg-gym-surface border border-gym-border rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-muted border border-accent/30 flex items-center justify-center font-display font-bold text-2xl text-accent flex-shrink-0">
              {member.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-text-primary">{member.full_name}</h1>
                <span className="font-mono text-sm px-2.5 py-0.5 rounded bg-gym-card border border-gym-border text-accent">
                  {member.member_code}
                </span>
                <Badge
                  variant={
                    member.computed_status === 'active'
                      ? 'success'
                      : member.computed_status === 'expired'
                      ? 'danger'
                      : 'neutral'
                  }
                >
                  {member.computed_status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Joined on {formatDate(member.created_at)}
              </p>
            </div>
          </div>

          {/* Membership Status Pill */}
          <div className="p-4 bg-gym-card rounded-xl border border-gym-border min-w-[240px]">
            <div className="text-xs text-text-muted">Current Subscription</div>
            <div className="text-sm font-semibold text-text-primary mt-0.5">
              {member.current_plan_name || 'No active plan'}
            </div>
            {member.current_expiry_date && (
              <div className="text-xs mt-2 flex items-center justify-between">
                <span className="text-text-secondary">Expires: {formatDate(member.current_expiry_date)}</span>
                {daysRemaining !== null && (
                  <span
                    className={`font-semibold ${
                      daysRemaining > 7
                        ? 'text-emerald-400'
                        : daysRemaining > 0
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days expired`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Athlete Details & Payment History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information & Contacts */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-5 bg-gym-surface border border-gym-border rounded-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted border-b border-gym-border pb-3">
              Athlete Profile
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-text-muted block">Phone</span>
                <span className="text-text-primary font-medium">{member.phone}</span>
              </div>

              <div>
                <span className="text-xs text-text-muted block">Email</span>
                <span className="text-text-primary">{member.email || '-'}</span>
              </div>

              <div>
                <span className="text-xs text-text-muted block">Date of Birth</span>
                <span className="text-text-primary">{member.date_of_birth ? formatDate(member.date_of_birth) : '-'}</span>
              </div>

              <div>
                <span className="text-xs text-text-muted block">Address</span>
                <span className="text-text-primary">{member.address || '-'}</span>
              </div>

              <div>
                <span className="text-xs text-text-muted block">Emergency Contact</span>
                <span className="text-text-primary">
                  {member.emergency_contact_name || '-'}
                  {member.emergency_contact_phone && ` (${member.emergency_contact_phone})`}
                </span>
              </div>

              {member.notes && (
                <div>
                  <span className="text-xs text-text-muted block">Fitness / Health Notes</span>
                  <p className="text-xs text-text-secondary bg-gym-bg p-2.5 rounded-lg border border-gym-border mt-1">
                    {member.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Receipt Ledger */}
        <div className="space-y-6 lg:col-span-2">
          <div className="p-5 bg-gym-surface border border-gym-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gym-border pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <ReceiptIcon className="w-4 h-4 text-accent" /> Payment & Receipt History
              </h2>
              <span className="text-xs text-text-muted">{payments.length} Records</span>
            </div>

            {payments.length === 0 ? (
              <div className="p-8 text-center text-text-muted border border-dashed border-gym-border rounded-xl">
                No payments recorded yet for this member.
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-gym-card/50 rounded-xl border border-gym-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-accent/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-accent">{p.receipt_number}</span>
                        <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>
                          {p.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {p.plan_name} • Paid on {formatDate(p.payment_date)} via {p.payment_method.toUpperCase()}
                      </div>
                      {p.notes && <div className="text-[11px] text-text-muted italic mt-0.5">{p.notes}</div>}
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gym-border/40">
                      <div>
                        <span className="text-sm font-bold font-mono text-text-primary">
                          {formatCurrency(p.amount_received)}
                        </span>
                        {parseFloat(p.balance_due) > 0 && (
                          <span className="text-xs text-amber-400 block font-mono">
                            Due: {formatCurrency(p.balance_due)}
                          </span>
                        )}
                      </div>

                      <Link to={`/admin/receipts`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-accent">
                          View Receipt
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renewal Modal */}
      <Modal
        open={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        title={`Renew Membership — ${member.full_name}`}
      >
        <form onSubmit={handleRenewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Select Package *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => handlePlanSelect(e.target.value)}
              className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.duration_days} Days ({formatCurrency(p.base_fee)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              type="date"
              value={renewStartDate}
              onChange={(e) => setRenewStartDate(e.target.value)}
              required
            />
            <Input
              label="Agreed Fee (₹) *"
              type="number"
              value={renewAgreedFee}
              onChange={(e) => setRenewAgreedFee(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount (₹)"
              type="number"
              value={renewDiscount}
              onChange={(e) => setRenewDiscount(e.target.value)}
            />
            <Input
              label="Amount Received (₹) *"
              type="number"
              value={renewAmountReceived}
              onChange={(e) => setRenewAmountReceived(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Payment Method *
            </label>
            <select
              value={renewPaymentMethod}
              onChange={(e) => setRenewPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash</option>
              <option value="card">Card (POS / Debit / Credit)</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gym-border">
            <Button type="button" variant="outline" onClick={() => setRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={renewLoading}>
              {renewLoading ? 'Processing...' : 'Confirm Renewal & Issue Receipt'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={archiveConfirmOpen}
        title={member.is_archived ? 'Restore Athlete' : 'Archive Athlete'}
        description={`Are you sure you want to ${member.is_archived ? 'restore' : 'archive'} ${member.full_name}?`}
        confirmLabel={member.is_archived ? 'Restore' : 'Archive'}
        variant={member.is_archived ? 'info' : 'danger'}
        onConfirm={handleToggleArchive}
        onCancel={() => setArchiveConfirmOpen(false)}
      />
    </div>
  );
}
