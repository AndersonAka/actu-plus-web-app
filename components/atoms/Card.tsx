'use client';

import { cn } from '@/lib/utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const Card = ({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        paddings[padding],
        hover && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('mb-4 border-b border-gray-100 pb-4', className)}>
    {children}
  </div>
);

const CardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
    {children}
  </h3>
);

const CardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={cn('mt-1 text-sm text-gray-500', className)}>{children}</p>
);

const CardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn('', className)}>{children}</div>;

const CardFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('mt-4 border-t border-gray-100 pt-4', className)}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
