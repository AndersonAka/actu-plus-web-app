'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { PublicShell } from '../PublicShell';
import { Button, Alert } from '@/components/atoms';
import {
  Bell,
  BellOff,
  ArrowLeft,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getNotificationVisual } from '@/lib/utils/notification-display';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/notifications');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxy/notifications?limit=50', {
        credentials: 'include',
      });
      if (response.ok) {
        const result = await response.json();
        // Backend peut renvoyer { success, data: { data: [...], total, ... } }
        // ou directement { data: [...], total, ... }
        const payload = result?.success ? result.data : result;
        const items = payload?.data || payload;
        setNotifications(Array.isArray(items) ? items : []);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchNotifications();
    }
  }, [isAuthenticated, authLoading, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/proxy/notifications/${id}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/proxy/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (authLoading) {
    return (
      <PublicShell>
        <div className="flex flex-1 items-center justify-center py-24">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#ffe0d9] border-t-[#ec3013]"></div>
            <p className="mt-4 text-[#605d5d]">Chargement...</p>
          </div>
        </div>
      </PublicShell>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <PublicShell>
      <div className="py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/profile"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#605d5d] hover:text-[#201e1d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#ffe0d9]">
                <Bell className="h-6 w-6 text-[#ae1800]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">Notifications</h1>
                <p className="text-sm text-[#605d5d]">
                  {unreadCount > 0
                    ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes lues'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button variant="modernist-outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="mr-1 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filter Tabs */}
          <div className="mb-4 flex gap-0 border border-[#201e1d]">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[#201e1d] text-white'
                  : 'text-[#201e1d] hover:bg-[#eae9e9]'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`border-l border-[#201e1d] px-4 py-2 text-sm font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-[#201e1d] text-white'
                  : 'text-[#201e1d] hover:bg-[#eae9e9]'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#ec3013]" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="border border-[#d7d3d3] bg-white p-12 text-center">
              <BellOff className="mx-auto h-12 w-12 text-[#d7d3d3]" />
              <h3 className="mt-4 text-lg font-bold text-[#201e1d]">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="mt-2 text-sm text-[#605d5d]">
                {filter === 'unread'
                  ? 'Vous avez lu toutes vos notifications.'
                  : "Vous n'avez pas encore reçu de notifications."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const { Icon, bgClass, iconColorClass } = getNotificationVisual(notification.type);
                return (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`flex items-start gap-4 border p-4 transition-colors cursor-pointer ${
                    notification.isRead
                      ? 'border-[#d7d3d3] bg-white'
                      : 'border-[#ec3013] bg-[#fff2ef] hover:bg-[#ffe0d9]'
                  }`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center ${bgClass}`}>
                    <Icon className={`h-5 w-5 ${iconColorClass}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notification.isRead ? 'text-[#605d5d]' : 'text-[#201e1d]'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#ec3013]"></span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-sm ${notification.isRead ? 'text-[#9b9797]' : 'text-[#605d5d]'}`}>
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-[#9b9797]">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
