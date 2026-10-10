// ============================================================================
// SearchInput — Debounced search with clear button
// ============================================================================
import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedChange = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (val: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => onChange(val), debounceMs);
      };
    })(),
    [onChange, debounceMs]
  );

  const handleChange = (val: string) => {
    setLocalValue(val);
    debouncedChange(val);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full bg-gym-bg border border-gym-border rounded-xl
          pl-10 pr-9 py-2.5 text-sm text-text-primary
          placeholder:text-text-muted
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
          hover:border-gym-border-light
        "
        aria-label={placeholder}
      />
      {localValue && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
