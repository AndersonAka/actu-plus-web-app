'use client';

import Link from 'next/link';
import { Sidebar } from '@/components/organisms';
import { NotificationDropdown } from '@/components/molecules';
import { useAuth } from '@/lib/hooks/useAuth';
import { Avatar } from '@/components/atoms';
import { Home, ChevronRight } from 'lucide-react';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  variant: 'veilleur' | 'moderateur' | 'admin';
}

const variantTitles = {
  veilleur: 'Espace Veilleur',
  moderateur: 'Espace Modérateur',
  admin: 'Administration',
};

const DashboardLayout = ({ children, variant }: DashboardLayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar variant={variant} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-gray-900">{variantTitles[variant]}</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown variant="dashboard" />
            <div className="flex items-center gap-2">
              <Avatar
                src={user?.avatar}
                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                size="sm"
              />
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };
