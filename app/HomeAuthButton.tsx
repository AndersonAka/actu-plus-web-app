'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

const buttonClass =
  'flex h-[42px] items-center border border-[var(--public-border)] px-4 text-sm font-semibold text-[#201e1d] transition-colors hover:bg-gray-50';

export function HomeAuthButton({ className }: { className?: string }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className={cn('h-[42px] w-[120px] animate-pulse bg-gray-100', className)} />;
  }

  if (isAuthenticated && user) {
    return (
      <Link href="/profile" className={cn(buttonClass, className)}>
        {user.firstName || 'Mon compte'}
      </Link>
    );
  }

  return (
    <Link href="/login" className={cn(buttonClass, className)}>
      Se connecter
    </Link>
  );
}
