'use client';

import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const Avatar = ({ src, alt, name, size = 'md', className }: AvatarProps) => {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const imageSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  if (src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-full bg-gray-200',
          sizes[size],
          className
        )}
      >
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="h-full w-full object-cover"
          unoptimized={true}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export { Avatar };
