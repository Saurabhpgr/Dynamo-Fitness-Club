// ============================================================================
// Textarea Component
// ============================================================================
import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, id, className = '', ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-status-expired ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full bg-gym-bg border rounded-xl px-4 py-2.5 text-sm text-text-primary
            placeholder:text-text-muted resize-y min-h-[80px]
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-status-expired' : 'border-gym-border hover:border-gym-border-light'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p className="text-sm text-status-expired" role="alert">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-xs text-text-muted">{helpText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
