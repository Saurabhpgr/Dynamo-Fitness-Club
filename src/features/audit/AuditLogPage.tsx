// ============================================================================
// Audit Log Page — Immutable audit ledger tracking all critical gym actions
// ============================================================================
import { useState, useEffect } from 'react';
import { dataService } from '@/services/dataService';
import type { AuditLog, AuditAction } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/date-utils';

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    dataService.getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const actionBadgeVariant = (action: AuditAction) => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'cancel':
      case 'delete':
        return 'danger';
      case 'reissue':
      case 'refund':
        return 'warning';
      case 'archive':
      case 'restore':
        return 'neutral';
      default:
        return 'default';
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (actionFilter === 'all') return true;
    return log.action === actionFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">System Audit Trail</h1>
          <p className="text-sm text-text-secondary">
            Append-only, immutable activity log tracking every member registration, payment, and receipt cancellation.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-gym-surface border border-gym-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="cancel">Cancel</option>
          <option value="reissue">Reissue</option>
          <option value="archive">Archive</option>
          <option value="restore">Restore</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted">Loading audit entries...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-gym-surface border border-dashed border-gym-border rounded-xl text-text-muted">
          No audit entries recorded.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gym-border bg-gym-surface">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gym-border text-xs uppercase text-text-muted font-semibold bg-gym-bg/50">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-border/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gym-card/40 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-text-secondary whitespace-nowrap">
                    {formatDateTime(log.performed_at)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={actionBadgeVariant(log.action)}>
                      {log.action.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 uppercase text-xs font-mono text-accent">
                    {log.entity_type}
                  </td>
                  <td className="py-3 px-4 text-xs text-text-secondary">
                    {log.performed_by || 'Admin'}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-text-muted">
                    {log.new_data ? JSON.stringify(log.new_data) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
