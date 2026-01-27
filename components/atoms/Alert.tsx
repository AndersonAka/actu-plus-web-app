'use client';

import { cn } from '@/lib/utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
  className?: string;
}

const Alert = ({
  children,
  variant = 'info',
  title,
  onClose,
  className,
}: AlertProps) => {
  const variants = {
    info: {
      container: 'bg-info-50 border-info-200 text-info-800',
      icon: <Info className="h-5 w-5 text-info-500" />,
    },
    success: {
      container: 'bg-success-50 border-success-200 text-success-800',
      icon: <CheckCircle className="h-5 w-5 text-success-500" />,
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-800',
      icon: <AlertCircle className="h-5 w-5 text-warning-500" />,
    },
    error: {
      container: 'bg-error-50 border-error-200 text-error-800',
      icon: <XCircle className="h-5 w-5 text-error-500" />,
    },
  };

  const { container, icon } = variants[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        container,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1">
        {title && <h4 className="mb-1 font-medium">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded p-1 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export { Alert };
