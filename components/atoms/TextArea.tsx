'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, hint, disabled, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 transition-colors',
            'placeholder:text-gray-400',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
            'min-h-[100px] resize-y',
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export { TextArea };
