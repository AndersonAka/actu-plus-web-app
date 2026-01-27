'use client';

import { cn } from '@/lib/utils/cn';

export interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

const Divider = ({
  className,
  orientation = 'horizontal',
  label,
}: DividerProps) => {
  if (orientation === 'vertical') {
    return (
      <div className={cn('h-full w-px bg-gray-200', className)} />
    );
  }

  if (label) {
    return (
      <div className={cn('flex items-center', className)}>
        <div className="flex-1 border-t border-gray-200" />
        <span className="px-3 text-sm text-gray-500">{label}</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>
    );
  }

  return <hr className={cn('border-t border-gray-200', className)} />;
};

export { Divider };
