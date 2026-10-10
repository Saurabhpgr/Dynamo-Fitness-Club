// ============================================================================
// Admin Dashboard Home — Business Analytics, Expiring Alerts & Operations
// ============================================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  UserPlus,
  Receipt,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { MemberWithStatus, PaymentWithDetails } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/money';
import { formatDate } from '@/lib/date-utils';

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalMembers: number;
    activeMembers: number;
    expiredMembers: number;
    expiringSoonCount: number;
    expiringSoonMembers: MemberWithStatus[];
    monthlyRevenueFormatted: string;
    unreadEnquiries: number;
    recentPayments: PaymentWithDetails[];
  } | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await dataService.getDashboardSummary();
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !summary) {
    return <div className="p-12 text-center text-text-muted">Loading dashboard metrics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Quick Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gym-surface p-6 rounded-2xl border border-gym-border relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Club Operations Live
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-text-primary">
            Welcome back, Dynamo Admin
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here is your live performance snapshot for today.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <Link to="/admin/members/add">
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" /> Add Member
            </Button>
          </Link>
          <Link to="/admin/payments">
            <Button variant="outline" size="sm" className="gap-2">
              <CreditCard className="w-4 h-4" /> Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Athletes */}
        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Active Members</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-text-primary">
            {summary.activeMembers}
          </div>
          <p className="text-xs text-text-muted">
            Out of <span className="font-semibold text-text-secondary">{summary.totalMembers}</span> registered
          </p>
        </div>

        {/* Card 2: Monthly Revenue */}
        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">This Month's Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-accent-muted text-accent flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-emerald-400">
            {summary.monthlyRevenueFormatted}
          </div>
          <p className="text-xs text-text-muted">Total collections recorded this month</p>
        </div>

        {/* Card 3: Expiring Soon Alert */}
        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Expiring in 7 Days</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-amber-400">
            {summary.expiringSoonCount}
          </div>
          <p className="text-xs text-text-muted">Urgent renewal follow-ups needed</p>
        </div>

        {/* Card 4: Unread Enquiries */}
        <div className="p-5 bg-gym-surface border border-gym-border rounded-xl space-y-2 hover:border-accent/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">New Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-blue-400">
            {summary.unreadEnquiries}
          </div>
          <p className="text-xs text-text-muted">Potential athletes from landing page</p>
        </div>
      </div>

      {/* Main Grid: Expiring Soon Action List & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Expiring Soon Follow-ups */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gym-border pb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Expiring Soon Follow-ups
              </h2>
              <p className="text-xs text-text-muted">Members whose subscription lapses within 7 days</p>
            </div>
            <Link to="/admin/members?status=active" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
              View All &rarr;
            </Link>
          </div>

          {summary.expiringSoonMembers.length === 0 ? (
            <div className="p-8 text-center text-text-muted border border-dashed border-gym-border rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="font-medium text-text-primary">All caught up!</p>
              <p className="text-xs text-text-muted">No memberships expiring in the next 7 days.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {summary.expiringSoonMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-gym-card rounded-xl border border-gym-border flex items-center justify-between gap-3 hover:border-accent/30 transition-colors"
                >
                  <div>
                    <Link to={`/admin/members/${m.id}`} className="font-semibold text-text-primary text-sm hover:underline">
                      {m.full_name}
                    </Link>
                    <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-accent">{m.member_code}</span>
                      <span>•</span>
                      <span>Expires: {m.current_expiry_date ? formatDate(m.current_expiry_date) : '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.phone && (
                      <a
                        href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${m.full_name}, reminder from Dynamo Fitness Club: your membership expires on ${m.current_expiry_date}. Kindly visit front-desk to renew!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-emerald-400 border-emerald-500/30">
                          <MessageCircle className="w-3.5 h-3.5" /> Remind
                        </Button>
                      </a>
                    )}
                    <Link to={`/admin/members/${m.id}`}>
                      <Button size="sm" className="h-8 text-xs">
                        Renew
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Collections Feed */}
        <div className="p-6 bg-gym-surface border border-gym-border rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gym-border pb-4">
            <div>
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Receipt className="w-4 h-4 text-accent" /> Recent Collections
              </h2>
              <p className="text-xs text-text-muted">Latest payment settlements and verified receipts</p>
            </div>
            <Link to="/admin/payments" className="text-xs text-accent font-medium hover:underline flex items-center gap-1">
              Ledger &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {summary.recentPayments.map((p) => (
              <div
                key={p.id}
                className="p-3.5 bg-gym-card rounded-xl border border-gym-border flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent">{p.receipt_number}</span>
                    <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>
                      {p.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {p.member_name} • {p.plan_name}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-text-primary text-sm">
                    {formatCurrency(p.amount_received)}
                  </div>
                  <div className="text-[11px] text-text-muted uppercase">
                    {p.payment_method}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
