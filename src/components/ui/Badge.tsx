// ============================================================================
// Badge Component — Status badges with semantic colors
// ============================================================================

type BadgeVariant =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'archived'
  | 'paid'
  | 'partial'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'cancelled'
  | 'issued'
  | 'reissued'
  | 'info'
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-status-active-bg text-status-active border-status-active/20',
  success: 'bg-status-active-bg text-status-active border-status-active/20',
  paid: 'bg-status-active-bg text-status-active border-status-active/20',
  issued: 'bg-status-active-bg text-status-active border-status-active/20',
  expiring: 'bg-status-expiring-bg text-status-expiring border-status-expiring/20',
  warning: 'bg-status-expiring-bg text-status-expiring border-status-expiring/20',
  partial: 'bg-status-expiring-bg text-status-expiring border-status-expiring/20',
  pending: 'bg-status-expiring-bg text-status-expiring border-status-expiring/20',
  expired: 'bg-status-expired-bg text-status-expired border-status-expired/20',
  danger: 'bg-status-expired-bg text-status-expired border-status-expired/20',
  failed: 'bg-status-expired-bg text-status-expired border-status-expired/20',
  cancelled: 'bg-status-expired-bg text-status-expired border-status-expired/20',
  refunded: 'bg-status-refunded-bg text-status-refunded border-status-refunded/20',
  reissued: 'bg-accent-muted text-accent border-accent/20',
  archived: 'bg-status-archived-bg text-status-archived border-status-archived/20',
  neutral: 'bg-status-archived-bg text-status-archived border-status-archived/20',
  info: 'bg-accent-muted text-accent border-accent/20',
  default: 'bg-gym-surface-hover text-text-secondary border-gym-border',
};

export function Badge({ variant = 'default', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
        border transition-colors
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/**
 * Helper to map member status to badge variant
 */
export function memberStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    active: 'active',
    expired: 'expired',
    inactive: 'archived',
    archived: 'archived',
  };
  return map[status] || 'default';
}

/**
 * Helper to map payment status to badge variant
 */
export function paymentStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    paid: 'paid',
    partial: 'partial',
    pending: 'pending',
    failed: 'failed',
    refunded: 'refunded',
    cancelled: 'cancelled',
  };
  return map[status] || 'default';
}
