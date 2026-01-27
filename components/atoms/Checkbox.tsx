'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, disabled, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex items-start">
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 bg-white transition-colors',
              'checked:border-primary-500 checked:bg-primary-500',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-error-500',
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'ml-2 cursor-pointer text-sm text-gray-700',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
        {error && <p className="ml-2 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
