'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Settings,
  Tag,
  Globe,
  Bell,
  CheckSquare,
  Clock,
  XCircle,
  Send,
  LogOut,
} from 'lucide-react';

export interface SidebarProps {
  variant: 'veilleur' | 'moderateur' | 'admin';
}

const Sidebar = ({ variant }: SidebarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/proxy/notifications/unread-count');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/proxy/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = {
    veilleur: [
      { href: '/veilleur', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
      { href: '/veilleur/articles', label: 'Mes articles', icon: FileText },
      { href: '/veilleur/articles/create', label: 'Nouvel article', icon: Send },
    ],
    moderateur: [
      { href: '/moderateur', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
      { href: '/moderateur/pending', label: 'En attente', icon: Clock },
      { href: '/moderateur/approved', label: 'Validés', icon: CheckSquare },
      { href: '/moderateur/rejected', label: 'Rejetés', icon: XCircle },
      { href: '/moderateur/published', label: 'Publiés', icon: FileText },
    ],
    admin: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
      { href: '/admin/articles', label: 'Articles', icon: FileText },
      { href: '/admin/users', label: 'Utilisateurs', icon: Users },
      { href: '/admin/categories', label: 'Catégories', icon: Tag },
      { href: '/admin/countries', label: 'Pays', icon: Globe },
      { href: '/admin/subscriptions', label: 'Abonnements', icon: CreditCard },
      { href: '/admin/notifications', label: 'Notifications', icon: Bell },
      { href: '/admin/settings', label: 'Paramètres', icon: Settings },
    ],
  };

  const items = menuItems[variant];

  const titles = {
    veilleur: 'Espace Veilleur',
    moderateur: 'Espace Modérateur',
    admin: 'Administration',
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-actu-plus.webp"
            alt="Actu Plus"
            width={100}
            height={32}
            className="h-8 w-auto"
            unoptimized={true}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {titles[variant]}
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            const showBadge = item.href === '/admin/notifications' && unreadCount > 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-50 font-medium text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1.5 text-xs font-medium text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick Links */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Liens rapides
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <Globe className="h-5 w-5" />
                Voir le site
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.avatar}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-error-600"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
};

export { Sidebar };
