'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export function HomeAuthButton() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-[42px] w-[120px] animate-pulse bg-[#eae9e9]" />;
  }

  if (isAuthenticated && user) {
    return (
      <Link
        href="/profile"
        className="flex h-[42px] items-center border border-[#201e1d] px-4 text-sm font-semibold text-[#201e1d] transition-colors hover:bg-[#eae9e9]"
      >
        {user.firstName || 'Mon compte'}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="flex h-[42px] items-center border border-[#201e1d] px-4 text-sm font-semibold text-[#201e1d] transition-colors hover:bg-[#eae9e9]"
    >
      Se connecter
    </Link>
  );
}
