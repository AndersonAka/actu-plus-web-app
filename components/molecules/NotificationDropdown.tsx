'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { 
  Bell, 
  FileText, 
  CreditCard, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

const notificationIcons: Record<string, typeof Bell> = {
  article_submitted: FileText,
  article_approved: CheckCircle,
  article_rejected: XCircle,
  article_published: FileText,
  subscription_created: CreditCard,
  subscription_activated: CheckCircle,
  subscription_expired: AlertCircle,
  subscription_cancelled: XCircle,
  payment_success: CreditCard,
  payment_failed: AlertCircle,
  user_registered: UserPlus,
  user_deactivated: AlertCircle,
  system: Bell,
};

const notificationColors: Record<string, string> = {
  article_submitted: 'bg-primary-100 text-primary-600',
  article_approved: 'bg-success-100 text-success-600',
  article_rejected: 'bg-error-100 text-error-600',
  article_published: 'bg-success-100 text-success-600',
  subscription_created: 'bg-primary-100 text-primary-600',
  subscription_activated: 'bg-success-100 text-success-600',
  subscription_expired: 'bg-warning-100 text-warning-600',
  subscription_cancelled: 'bg-error-100 text-error-600',
  payment_success: 'bg-success-100 text-success-600',
  payment_failed: 'bg-error-100 text-error-600',
  user_registered: 'bg-primary-100 text-primary-600',
  user_deactivated: 'bg-warning-100 text-warning-600',
  system: 'bg-gray-100 text-gray-600',
};

export interface NotificationDropdownProps {
  variant?: 'header' | 'dashboard';
  className?: string;
}

const NotificationDropdown = ({ variant = 'header', className }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy/notifications?limit=5');
      if (response.ok) {
        const result = await response.json();
        const payload = result?.data ?? result;
        const notifList = Array.isArray(payload) ? payload : (payload?.data || []);
        setNotifications(notifList);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/proxy/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/proxy/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    return notificationIcons[type] || Bell;
  };

  const getColor = (type: string) => {
    return notificationColors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative rounded-full p-2 transition-colors',
          variant === 'header' 
            ? 'hover:bg-gray-100' 
            : 'hover:bg-gray-100'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500 px-1 text-xs font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl',
          variant === 'dashboard' && 'sm:w-96'
        )}>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
              >
                <Check className="h-3 w-3" />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  const colorClass = getColor(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                      className={cn(
                        'flex gap-3 px-4 py-3 transition-colors cursor-pointer',
                        !notification.isRead ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.createdAt), 'dd MMM à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0">
                          <span className="block h-2 w-2 rounded-full bg-primary-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/admin/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-3 text-sm font-medium text-primary-600 hover:bg-gray-50"
          >
            Voir toutes les notifications
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export { NotificationDropdown };
