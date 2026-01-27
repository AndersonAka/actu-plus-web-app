'use client';

import { Sidebar } from '@/components/organisms';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  variant: 'veilleur' | 'moderateur' | 'admin';
}

const DashboardLayout = ({ children, variant }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar variant={variant} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export { DashboardLayout };
