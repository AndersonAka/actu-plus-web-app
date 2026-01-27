'use client';

import { cn } from '@/lib/utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton = ({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variants[variant],
        variant === 'text' && 'h-4',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        className={i === lines - 1 ? 'w-3/4' : 'w-full'}
      />
    ))}
  </div>
);

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('rounded-lg border border-gray-200 p-4', className)}>
    <Skeleton variant="rectangular" className="mb-4 h-48 w-full" />
    <Skeleton variant="text" className="mb-2 h-6 w-3/4" />
    <SkeletonText lines={2} />
  </div>
);

export { Skeleton, SkeletonText, SkeletonCard };
