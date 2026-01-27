'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  icon?: React.ReactNode;
}

const NavLink = ({
  href,
  children,
  className,
  activeClassName = 'text-primary-600 font-medium',
  exact = false,
  icon,
}: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 text-gray-600 transition-colors hover:text-primary-600',
        className,
        isActive && activeClassName
      )}
    >
      {icon}
      {children}
    </Link>
  );
};

export { NavLink };
