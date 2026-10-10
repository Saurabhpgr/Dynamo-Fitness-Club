// ============================================================================
// ConfirmDialog — For destructive or financially significant actions
// ============================================================================
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const isDialogVisible = open ?? isOpen ?? false;
  const handleClose = onCancel ?? onClose ?? (() => {});
  const displayMessage = description ?? message ?? '';
  return (
    <Modal isOpen={isDialogVisible} onClose={handleClose} size="sm">
      <div className="text-center">
        <div
          className={`
            w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center
            ${variant === 'danger' ? 'bg-status-expired-bg' : variant === 'warning' ? 'bg-status-expiring-bg' : 'bg-accent-muted'}
          `}
        >
          <AlertTriangle
            className={`w-7 h-7 ${
              variant === 'danger' ? 'text-status-expired' : variant === 'warning' ? 'text-status-expiring' : 'text-accent'
            }`}
          />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{displayMessage}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
