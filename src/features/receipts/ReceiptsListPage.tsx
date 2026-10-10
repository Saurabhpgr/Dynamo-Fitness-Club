// ============================================================================
// Receipts List Page — Browse, Verify, Print, Cancel & Reissue receipts
// ============================================================================
import { useState, useEffect } from 'react';
import { Search, Eye, AlertTriangle } from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { Receipt } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/money';
import { ReceiptView } from './ReceiptPdf';

export function ReceiptsListPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Active Receipt Preview
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Cancel & Reissue Dialog
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Receipt | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [reissueChecked, setReissueChecked] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await dataService.getReceipts();
      setReceipts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = receipts.filter((r) => {
    const s = search.toLowerCase().trim();
    const matchSearch =
      !s ||
      r.receipt_number.toLowerCase().includes(s) ||
      r.snapshot_data.member.full_name.toLowerCase().includes(s) ||
      r.snapshot_data.member.member_code.toLowerCase().includes(s);

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCancelModal = (r: Receipt) => {
    setCancelTarget(r);
    setCancelReason('');
    setReissueChecked(false);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTarget || !cancelReason.trim()) return;

    setProcessingCancel(true);
    try {
      await dataService.cancelAndReissueReceipt(cancelTarget.id, cancelReason.trim(), reissueChecked);
      setCancelModalOpen(false);
      setSelectedReceipt(null);
      fetchReceipts();
    } finally {
      setProcessingCancel(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Receipt Archives</h1>
        <p className="text-sm text-text-secondary">
          Official immutable receipt records, verification seals, cancellation audits & reissue history.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt number (DFC-2026-...) or member name..."
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
          <option value="all">All Receipts</option>
          <option value="issued">Issued (Active)</option>
          <option value="reissued">Reissued</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center text-text-muted">Loading receipts...</div>
      ) : filteredReceipts.length === 0 ? (
        <div className="p-12 text-center bg-gym-surface border border-dashed border-gym-border rounded-xl text-text-muted">
          No receipts matching your search.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gym-border bg-gym-surface">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gym-border text-xs uppercase text-text-muted font-semibold bg-gym-bg/50">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Athlete</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/50">
              {filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-gym-card/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-accent text-xs">
                    {r.receipt_number}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-text-primary">{r.snapshot_data.member.full_name}</span>
                    <span className="text-xs text-text-muted block font-mono">
                      {r.snapshot_data.member.member_code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{r.snapshot_data.membership.plan_name}</td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{formatDate(r.issued_at)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-text-primary">
                    {formatCurrency(r.snapshot_data.payment.amount_received)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant={
                        r.status === 'issued'
                          ? 'success'
                          : r.status === 'reissued'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {r.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-accent"
                        onClick={() => setSelectedReceipt(r)}
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>

                      {r.status === 'issued' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-400"
                          onClick={() => openCancelModal(r)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Full Modal Viewer & Printable PDF */}
      {selectedReceipt && (
        <ReceiptView
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onCancelRequest={() => openCancelModal(selectedReceipt)}
        />
      )}

      {/* Cancellation / Reissue Dialog */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Cancel Receipt ${cancelTarget?.receipt_number}`}
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Cancelling a receipt is an audited financial action. The receipt will permanently display a
              CANCELLED watermark, and an entry will be written to the system audit ledger.
            </span>
          </div>

          <Textarea
            label="Cancellation Reason *"
            placeholder="e.g. Member opted for a different package / Billing correction / Refund"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={reissueChecked}
              onChange={(e) => setReissueChecked(e.target.checked)}
              className="rounded border-gym-border text-accent focus:ring-accent"
            />
            Automatically generate a Reissued Replacement Receipt
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-gym-border">
            <Button type="button" variant="outline" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button type="submit" variant="danger" disabled={processingCancel || !cancelReason.trim()}>
              {processingCancel ? 'Processing...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
