'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon: React.ReactNode;
  'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
      secondary:
        'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
      outline:
        'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger:
        'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
    };

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin', iconSizes[size])} />
        ) : (
          <span className={iconSizes[size]}>{icon}</span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };
