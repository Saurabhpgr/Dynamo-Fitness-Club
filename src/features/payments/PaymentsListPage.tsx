// ============================================================================
// Payments List Page — Financial transactions ledger, dues tracking & export
// ============================================================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Download,
  Plus,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { PaymentWithDetails, MemberWithStatus, PaymentMethod } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/money';
import { formatDate } from '@/lib/date-utils';

export function PaymentsListPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New Payment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amountCharged, setAmountCharged] = useState('1500');
  const [discount, setDiscount] = useState('0');
  const [amountReceived, setAmountReceived] = useState('1500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await dataService.getPayments({ search, status: statusFilter });
      setPayments(data);
      const m = await dataService.getMembers();
      setMembers(m.data);
      const firstMem = m.data[0];
      if (firstMem && !selectedMemberId) {
        setSelectedMemberId(firstMem.id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, statusFilter]);

  const summary = useMemo(() => {
    const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount_received || '0'), 0);
    const totalDue = payments.reduce((sum, p) => sum + parseFloat(p.balance_due || '0'), 0);
    return { totalCollected, totalDue };
  }, [payments]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setSubmitting(true);
    try {
      const idempotency_key = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await dataService.recordPayment({
        member_id: selectedMemberId,
        membership_id: `ms_${Date.now()}`,
        amount_charged: amountCharged,
        discount,
        amount_received: amountReceived,
        payment_method: paymentMethod,
        transaction_reference: transactionRef || undefined,
        notes: notes || undefined,
        idempotency_key,
      });

      setModalOpen(false);
      fetchPayments();
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Receipt #,Date,Member Code,Member Name,Plan,Method,Amount Received,Balance Due,Status'];
    const rows = payments.map((p) =>
      `"${p.receipt_number}","${p.payment_date}","${p.member_code}","${p.member_name}","${p.plan_name}","${p.payment_method}","${p.amount_received}","${p.balance_due}","${p.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dynamo_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Payment Records</h1>
          <p className="text-sm text-text-secondary">
            Financial ledger, fee receipts, dues clearance, and payment settlement breakdown.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Record Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Revenue Collected</span>
          <div className="text-2xl font-display font-black text-emerald-400 mt-1">
            {formatCurrency(summary.totalCollected.toFixed(2))}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">Across displayed payments</p>
        </div>

        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl">
          <span className="text-xs text-text-muted uppercase font-semibold">Outstanding Dues</span>
          <div className="text-2xl font-display font-black text-amber-400 mt-1">
            {formatCurrency(summary.totalDue.toFixed(2))}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">Partial balance pending collection</p>
        </div>

        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl sm:col-span-2 lg:col-span-1">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Transactions</span>
          <div className="text-2xl font-display font-black text-text-primary mt-1">
            {payments.length}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5">Verified receipts generated</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt # (DFC-2026-...), member name, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gym-surface border border-gym-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gym-surface border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid in Full</option>
          <option value="partial">Partial Payment</option>
        </select>
      </div>

      {/* Main Ledger Table */}
      {loading ? (
        <div className="p-12 text-center text-text-muted">Loading transactions...</div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center bg-gym-surface border border-dashed border-gym-border rounded-xl text-text-muted">
          No payment records found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gym-border bg-gym-surface">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gym-border text-xs uppercase text-text-muted font-semibold bg-gym-bg/50">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Received</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gym-card/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-accent text-xs">
                    {p.receipt_number}
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/admin/members/${p.member_id}`} className="hover:underline font-medium text-text-primary">
                      {p.member_name}
                    </Link>
                    <div className="text-xs text-text-muted font-mono">{p.member_code}</div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{p.plan_name}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(p.payment_date)}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs uppercase px-2 py-0.5 rounded bg-gym-bg border border-gym-border font-mono">
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-text-primary">
                    {formatCurrency(p.amount_received)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {parseFloat(p.balance_due) > 0 ? (
                      <span className="text-amber-400 font-semibold">{formatCurrency(p.balance_due)}</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>
                      {p.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to="/admin/receipts">
                      <Button variant="ghost" size="icon" title="View PDF Receipt">
                        <ReceiptIcon className="w-4 h-4 text-accent" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record New Payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Select Member *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-gym-bg border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code}) — {m.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Charged (₹) *"
              type="number"
              value={amountCharged}
              onChange={(e) => setAmountCharged(e.target.value)}
              required
            />
            <Input
              label="Discount (₹)"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Input
              label="Received (₹) *"
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              </select>
            </div>
            <Input
              label="Transaction Ref / Note"
              placeholder="e.g. UPI Ref # or Bill #"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
            />
          </div>

          <Input
            label="Internal Notes (Optional)"
            placeholder="e.g. Cleared pending dues for October"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-gym-border">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Generate Receipt & Settle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
