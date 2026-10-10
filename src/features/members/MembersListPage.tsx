// ============================================================================
// Members List Page — Search, Filter by Status, Pagination, Mobile Card View
// ============================================================================
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Eye,
  CreditCard,
  Archive,
  RotateCcw,
  MessageCircle,
  Phone,
  Calendar,
  AlertCircle,
  Download,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import type { MemberWithStatus, MemberStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/date-utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function MembersListPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [members, setMembers] = useState<MemberWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [archiveTarget, setArchiveTarget] = useState<MemberWithStatus | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<MemberWithStatus | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await dataService.getMembers({ search, status: statusFilter });
      setMembers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter]);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    await dataService.archiveMember(archiveTarget.id);
    setArchiveTarget(null);
    fetchMembers();
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    await dataService.restoreMember(restoreTarget.id);
    setRestoreTarget(null);
    fetchMembers();
  };

  const statusBadgeVariant = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'danger';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'neutral';
      default:
        return 'default';
    }
  };

  const exportCSV = () => {
    const headers = ['Member Code,Full Name,Phone,Email,Status,Current Plan,Expiry Date'];
    const rows = members.map((m) =>
      `"${m.member_code}","${m.full_name}","${m.phone}","${m.email || ''}","${m.computed_status}","${m.current_plan_name || ''}","${m.current_expiry_date || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dynamo_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Members</h1>
          <p className="text-sm text-text-secondary">
            Manage your athlete directory, monitor membership expiration, and record dues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Link to="/admin/members/add">
            <Button size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" /> Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-gym-border text-sm">
        {[
          { key: 'all', label: 'All Members' },
          { key: 'active', label: 'Active' },
          { key: 'expired', label: 'Expired' },
          { key: 'inactive', label: 'Inactive' },
          { key: 'archived', label: 'Archived' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2.5 font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              statusFilter === tab.key
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone (+91...), or code (DFC-M-0001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gym-surface border border-gym-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-text-muted">Loading members list...</div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-gym-border rounded-xl bg-gym-surface">
          <AlertCircle className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-primary font-medium">No members found</p>
          <p className="text-xs text-text-muted mt-1">Try tweaking your search keywords or filter status.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gym-border bg-gym-surface">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gym-border text-xs uppercase text-text-muted font-semibold bg-gym-bg/50">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Current Plan</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border/50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gym-card/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-text-primary">{member.full_name}</div>
                      <div className="text-xs text-accent font-mono">{member.member_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-text-secondary">{member.phone}</div>
                      {member.email && <div className="text-xs text-text-muted truncate max-w-[180px]">{member.email}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadgeVariant(member.computed_status)}>
                        {member.computed_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {member.current_plan_name || <span className="text-text-muted italic">None</span>}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {member.current_expiry_date ? formatDate(member.current_expiry_date) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/admin/members/${member.id}`} title="View Member Profile">
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-text-secondary" />
                          </Button>
                        </Link>

                        {member.phone && (
                          <a
                            href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${member.full_name}, greeting from Dynamo Fitness Club!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                          >
                            <Button variant="ghost" size="icon">
                              <MessageCircle className="w-4 h-4 text-emerald-400" />
                            </Button>
                          </a>
                        )}

                        {member.is_archived ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Restore Member"
                            onClick={() => setRestoreTarget(member)}
                          >
                            <RotateCcw className="w-4 h-4 text-emerald-400" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Archive Member"
                            onClick={() => setArchiveTarget(member)}
                          >
                            <Archive className="w-4 h-4 text-rose-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (< 768px) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-4 bg-gym-surface border border-gym-border rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-text-primary text-base">{member.full_name}</h3>
                    <span className="text-xs font-mono text-accent">{member.member_code}</span>
                  </div>
                  <Badge variant={statusBadgeVariant(member.computed_status)}>
                    {member.computed_status}
                  </Badge>
                </div>

                <div className="text-xs text-text-secondary space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-text-muted" />
                    <span>{member.phone}</span>
                  </div>
                  {member.current_plan_name && (
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-text-muted" />
                      <span>{member.current_plan_name}</span>
                    </div>
                  )}
                  {member.current_expiry_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      <span>Expires: {formatDate(member.current_expiry_date)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gym-border flex items-center justify-between">
                  <Link to={`/admin/members/${member.id}`} className="text-xs text-accent font-medium hover:underline">
                    View Profile &rarr;
                  </Link>

                  <div className="flex items-center gap-1">
                    {member.phone && (
                      <a
                        href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                        </Button>
                      </a>
                    )}
                    {member.is_archived ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-400"
                        onClick={() => setRestoreTarget(member)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-400"
                        onClick={() => setArchiveTarget(member)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Archive Member"
        description={`Are you sure you want to archive ${archiveTarget?.full_name}? Archived members are hidden from active filters but their payment and receipt histories are strictly preserved.`}
        confirmLabel="Archive"
        variant="danger"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="Restore Member"
        description={`Do you want to restore ${restoreTarget?.full_name} back to the active directory?`}
        confirmLabel="Restore"
        variant="default"
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}
