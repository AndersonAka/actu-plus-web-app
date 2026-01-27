'use client';

import { cn } from '@/lib/utils/cn';

export interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

const FormField = ({
  children,
  label,
  error,
  hint,
  required,
  className,
  htmlFor,
}: FormFieldProps) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="mt-1.5 text-sm text-error-500">{error}</p>}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export { FormField };
