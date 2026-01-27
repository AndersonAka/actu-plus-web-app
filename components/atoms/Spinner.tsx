'use client';

import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary-500', sizes[size], className)}
    />
  );
};

const SpinnerOverlay = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'absolute inset-0 flex items-center justify-center bg-white/80',
      className
    )}
  >
    <Spinner size="lg" />
  </div>
);

export { Spinner, SpinnerOverlay };
