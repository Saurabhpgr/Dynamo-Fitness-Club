// ============================================================================
// Reports & Analytics Page — Revenue breakdowns, member retention, export
// ============================================================================
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { PaymentWithDetails, MemberWithStatus, MembershipPlan } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/money';

export function ReportsPage() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dataService.getPayments(),
      dataService.getMembers(),
      dataService.getPlans(),
    ]).then(([p, m, pl]) => {
      setPayments(p.data);
      setMembers(m.data);
      setPlans(pl);
      setLoading(false);
    });
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount_received || '0'), 0);
  const totalBalanceDue = payments.reduce((sum, p) => sum + parseFloat(p.balance_due || '0'), 0);

  // Method breakdown
  const methodTotals: Record<string, number> = {};
  payments.forEach((p) => {
    methodTotals[p.payment_method] = (methodTotals[p.payment_method] || 0) + parseFloat(p.amount_received || '0');
  });

  const exportReport = () => {
    const headers = ['Report Metric,Value'];
    const rows = [
      `"Total Registered Members","${members.length}"`,
      `"Active Members","${members.filter((m) => m.computed_status === 'active').length}"`,
      `"Expired Members","${members.filter((m) => m.computed_status === 'expired').length}"`,
      `"Total Gross Revenue Collected","${totalRevenue.toFixed(2)}"`,
      `"Total Pending Dues","${totalBalanceDue.toFixed(2)}"`,
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `dynamo_report_summary_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading business reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Business Reports & Analytics</h1>
          <p className="text-sm text-text-secondary">
            Revenue velocity, cashflow settlement channels, member retention and distribution.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportReport} className="gap-2">
          <Download className="w-4 h-4" /> Export Report CSV
        </Button>
      </div>

      {/* Top Aggregations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Revenue Sunk</span>
          <div className="text-2xl font-display font-black text-emerald-400 mt-1">
            {formatCurrency(totalRevenue.toFixed(2))}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Across all confirmed receipt issuances</p>
        </div>

        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl">
          <span className="text-xs text-text-muted uppercase font-semibold">Uncollected Arrears (Dues)</span>
          <div className="text-2xl font-display font-black text-amber-400 mt-1">
            {formatCurrency(totalBalanceDue.toFixed(2))}
          </div>
          <p className="text-xs text-text-muted mt-0.5">Receivable from active & partial subscriptions</p>
        </div>

        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl">
          <span className="text-xs text-text-muted uppercase font-semibold">Registered Member Base</span>
          <div className="text-2xl font-display font-black text-text-primary mt-1">
            {members.length}
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Active: <span className="text-emerald-400 font-semibold">{members.filter((m) => m.computed_status === 'active').length}</span> | Expired: <span className="text-rose-400 font-semibold">{members.filter((m) => m.computed_status === 'expired').length}</span>
          </p>
        </div>
      </div>

      {/* Payment Channel Breakdown */}
      <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
        <h2 className="text-base font-bold text-text-primary border-b border-gym-border pb-3">
          Payment Method Channel Distribution
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(methodTotals).map(([method, amt]) => {
            const pct = totalRevenue > 0 ? ((amt / totalRevenue) * 100).toFixed(1) : '0';
            return (
              <div key={method} className="p-4 bg-gym-card rounded-xl border border-gym-border space-y-1">
                <span className="text-xs uppercase font-mono font-bold text-accent">{method}</span>
                <div className="text-xl font-bold font-mono text-text-primary">{formatCurrency(amt.toFixed(2))}</div>
                <div className="text-xs text-text-muted">{pct}% of total revenue</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Performance Breakdown */}
      <div className="p-6 bg-gym-surface border border-gym-border rounded-xl space-y-4">
        <h2 className="text-base font-bold text-text-primary border-b border-gym-border pb-3">
          Membership Plan Breakdown
        </h2>

        <div className="divide-y divide-gym-border">
          {plans.map((plan) => {
            const enrolled = members.filter((m) => m.current_plan_name === plan.name).length;
            return (
              <div key={plan.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">{plan.name}</div>
                  <div className="text-xs text-text-muted">{plan.duration_days} Days validity • {formatCurrency(plan.base_fee)}</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-text-primary font-mono">{enrolled}</span>
                  <span className="text-xs text-text-muted block">Enrolled athletes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
