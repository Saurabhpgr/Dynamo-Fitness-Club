// ============================================================================
// Card & KPICard Components
// ============================================================================
import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-gym-surface border border-gym-border rounded-xl
        ${paddingMap[padding]}
        ${hover ? 'transition-all duration-300 hover:border-accent/30 hover:shadow-card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean } | null;
  color?: string;
  onClick?: () => void;
}

export function KPICard({ label, value, icon, trend, color = 'text-accent', onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-gym-surface border border-gym-border rounded-xl p-5
        transition-all duration-300 hover:border-accent/30 hover:shadow-card
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && <div className={`${color} opacity-70`}>{icon}</div>}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {trend && (
        <p
          className={`text-xs mt-2 ${
            trend.positive ? 'text-status-active' : 'text-status-expired'
          }`}
        >
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  );
}
