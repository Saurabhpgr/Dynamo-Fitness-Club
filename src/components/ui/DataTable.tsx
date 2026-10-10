// ============================================================================
// DataTable — Server-paginated table with mobile card fallback
// ============================================================================
import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  mobileHidden?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  renderMobileCard?: (row: T, index: number) => ReactNode;
  keyExtractor: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  onRowClick,
  sortBy,
  sortDir,
  onSort,
  renderMobileCard,
  keyExtractor,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gym-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    text-left py-3 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer hover:text-text-secondary select-none' : ''}
                    ${col.className || ''}
                  `}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortBy === col.key && (
                      <span className="text-accent">
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-gym-border/50">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4">
                      <div className="h-4 bg-gym-border/30 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    border-b border-gym-border/50 transition-colors
                    hover:bg-gym-surface-hover/50
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3 px-4 text-text-primary ${col.className || ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`mskel-${i}`} className="bg-gym-surface border border-gym-border rounded-xl p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-gym-border/30 rounded w-2/3" />
              <div className="h-3 bg-gym-border/30 rounded w-1/2" />
              <div className="h-3 bg-gym-border/30 rounded w-1/3" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-text-muted">{emptyMessage}</div>
        ) : renderMobileCard ? (
          data.map((row, i) => (
            <div key={keyExtractor(row)} onClick={() => onRowClick?.(row)}>
              {renderMobileCard(row, i)}
            </div>
          ))
        ) : (
          data.map((row) => (
            <div
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`
                bg-gym-surface border border-gym-border rounded-xl p-4 space-y-2
                ${onRowClick ? 'cursor-pointer hover:border-accent/30' : ''}
              `}
            >
              {columns
                .filter((c) => !c.mobileHidden)
                .map((col) => (
                  <div key={col.key} className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">{col.header}</span>
                    <span className="text-sm text-text-primary">{col.render(row)}</span>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gym-border">
          <p className="text-sm text-text-muted">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page <= 1}
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 text-sm text-text-secondary">
              {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
