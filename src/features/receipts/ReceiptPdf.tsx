// ============================================================================
// Printable / Downloadable Digital Receipt Component
// Renders pixel-perfect receipt layout with QR verification and Indian words format
// ============================================================================
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, MessageCircle, X, CheckCircle } from 'lucide-react';
import type { Receipt } from '@/types';
import { formatCurrency } from '@/lib/money';
import { formatDate } from '@/lib/date-utils';
import { amountInWords } from '@/lib/amount-in-words';
import { Button } from '@/components/ui/Button';

interface ReceiptViewProps {
  receipt: Receipt;
  onClose: () => void;
  onCancelRequest?: () => void;
}

export function ReceiptView({ receipt, onClose, onCancelRequest }: ReceiptViewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const receiptRef = useRef<HTMLDivElement>(null);

  const { snapshot_data: data, status, receipt_number } = receipt;
  const isCancelled = status === 'cancelled';
  const isReissued = status === 'reissued';

  useEffect(() => {
    // Generate verification QR code encoding the receipt verification URL/Payload
    const payload = `DYNAMO_FITNESS_CLUB:RECEIPT:${receipt_number}:MEMBER:${data.member.member_code}:AMT:${data.payment.amount_received}`;
    QRCode.toDataURL(payload, { width: 120, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [receipt_number, data]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = data.member.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${data.member.full_name}, here is your payment receipt ${receipt_number} for ₹${data.payment.amount_received} from Dynamo Fitness Club. Thank you for training with us!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gym-surface border border-gym-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-gym-card border-b border-gym-border flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-accent">{receipt_number}</span>
            {isCancelled && (
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                CANCELLED
              </span>
            )}
            {isReissued && (
              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                REISSUED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1.5 text-emerald-400">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
            {onCancelRequest && !isCancelled && (
              <Button variant="ghost" size="sm" onClick={onCancelRequest} className="text-rose-400 text-xs">
                Cancel Receipt
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5 text-text-muted" />
            </Button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div
          ref={receiptRef}
          id="printable-receipt"
          className="p-8 sm:p-10 bg-white text-zinc-900 relative font-sans leading-relaxed select-text"
        >
          {/* Watermark for Cancelled / Reissued */}
          {isCancelled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <span className="text-7xl sm:text-8xl font-black text-red-600 rotate-[-30deg] border-8 border-red-600 px-6 py-2 rounded-xl">
                CANCELLED
              </span>
            </div>
          )}

          {isReissued && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
              <span className="text-7xl sm:text-8xl font-black text-amber-600 rotate-[-30deg] border-8 border-amber-600 px-6 py-2 rounded-xl">
                REISSUED
              </span>
            </div>
          )}

          {/* Header */}
          <div className="border-b-2 border-zinc-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase font-display">
                  {data.gym.name}
                </h1>
                <p className="text-xs text-zinc-600 mt-1 max-w-sm leading-normal">
                  {data.gym.address}
                </p>
                <div className="text-xs text-zinc-600 mt-1">
                  Phone: <span className="font-semibold text-zinc-900">{data.gym.phone}</span> | Email: {data.gym.email}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-block bg-zinc-950 text-white px-3 py-1 text-xs uppercase tracking-widest font-bold rounded">
                  OFFICIAL RECEIPT
                </div>
                <div className="font-mono text-base font-bold text-zinc-950 mt-2">
                  {receipt_number}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Date: {formatDate(data.payment.payment_date || receipt.issued_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Member & Subscription Details */}
          <div className="grid grid-cols-2 gap-6 pb-6 mb-6 border-b border-zinc-200 text-xs">
            <div>
              <span className="font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <div className="font-bold text-sm text-zinc-900">{data.member.full_name}</div>
              <div className="text-zinc-600 mt-0.5 font-mono">ID: {data.member.member_code}</div>
              <div className="text-zinc-600 mt-0.5">Phone: {data.member.phone}</div>
            </div>

            <div>
              <span className="font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Membership Details
              </span>
              <div className="font-bold text-sm text-zinc-900">{data.membership.plan_name}</div>
              <div className="text-zinc-600 mt-0.5">
                Validity: {formatDate(data.membership.start_date)} to {formatDate(data.membership.expiry_date)}
              </div>
              <div className="text-zinc-600 mt-0.5">
                Mode: <span className="font-semibold uppercase">{data.payment.payment_method}</span>
                {data.payment.transaction_reference && ` (${data.payment.transaction_reference})`}
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="mb-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-zinc-800 font-bold uppercase tracking-wider">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Agreed Fee</th>
                  <th className="py-2 text-right">Discount</th>
                  <th className="py-2 text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-3">
                    <span className="font-bold text-zinc-950">{data.membership.plan_name}</span>
                    <span className="block text-[11px] text-zinc-500">
                      Access to complete gym floor, cardio deck, free weights & locker facilities
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-medium">
                    {formatCurrency(data.payment.amount_charged)}
                  </td>
                  <td className="py-3 text-right font-mono text-zinc-500">
                    {formatCurrency(data.payment.discount || '0.00')}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-zinc-950">
                    {formatCurrency(
                      (
                        parseFloat(data.payment.amount_charged) - parseFloat(data.payment.discount || '0')
                      ).toFixed(2)
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount In Words & Totals Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-zinc-900 items-start">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Amount In Words
                </span>
                <p className="text-xs font-semibold text-zinc-900 italic mt-0.5 leading-snug">
                  {amountInWords(data.payment.amount_received)}
                </p>
              </div>

              {qrDataUrl && (
                <div className="flex items-center gap-3 pt-2">
                  <img src={qrDataUrl} alt="Receipt QR verification" className="w-16 h-16 border border-zinc-300 rounded p-1" />
                  <div className="text-[10px] text-zinc-500 leading-tight">
                    <span className="font-bold text-zinc-700 block">Verified Digital Receipt</span>
                    Scan QR code on device to verify digital seal and authenticity.
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Total Amount Charged:</span>
                <span className="font-mono">{formatCurrency(data.payment.amount_charged)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatCurrency(data.payment.discount || '0.00')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-950 border-t border-zinc-200 pt-2">
                <span>Amount Received:</span>
                <span className="font-mono text-emerald-700">{formatCurrency(data.payment.amount_received)}</span>
              </div>
              {parseFloat(data.payment.balance_due) > 0 ? (
                <div className="flex justify-between text-amber-700 font-bold border-t border-zinc-200 pt-1">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatCurrency(data.payment.balance_due)}</span>
                </div>
              ) : (
                <div className="text-[11px] text-emerald-600 font-bold text-right pt-1 flex items-center justify-end gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> PAID IN FULL
                </div>
              )}
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-zinc-200 text-[10px] text-zinc-500 text-center leading-normal">
            <p className="font-medium text-zinc-700">{data.gym.receipt_footer}</p>
            <p className="mt-0.5">
              Fees once paid are non-refundable & non-transferable. This is a computer-generated digital receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
