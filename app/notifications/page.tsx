'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header, Footer } from '@/components/organisms';
import { Button, Alert } from '@/components/atoms';
import {
  Bell,
  BellOff,
  ArrowLeft,
  CheckCheck,
  CreditCard,
  Crown,
  AlertTriangle,
  Info,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'payment_success':
      return <CreditCard className="h-5 w-5 text-green-600" />;
    case 'payment_failed':
      return <CreditCard className="h-5 w-5 text-red-600" />;
    case 'subscription_activated':
      return <Crown className="h-5 w-5 text-blue-600" />;
    case 'subscription_cancelled':
      return <Crown className="h-5 w-5 text-orange-600" />;
    case 'subscription_expired':
      return <Crown className="h-5 w-5 text-gray-600" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    default:
      return <Info className="h-5 w-5 text-primary-600" />;
  }
}

function getNotificationBg(type: string) {
  switch (type) {
    case 'payment_success':
      return 'bg-green-100';
    case 'payment_failed':
      return 'bg-red-100';
    case 'subscription_activated':
      return 'bg-blue-100';
    case 'subscription_cancelled':
      return 'bg-orange-100';
    case 'subscription_expired':
      return 'bg-gray-100';
    case 'alert':
      return 'bg-yellow-100';
    default:
      return 'bg-primary-100';
  }
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/profile"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0
                    ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes lues'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
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
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center shadow-sm">
              <BellOff className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {filter === 'unread'
                  ? 'Vous avez lu toutes vos notifications.'
                  : "Vous n'avez pas encore reçu de notifications."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer ${
                    notification.isRead
                      ? 'border-gray-100 bg-white'
                      : 'border-primary-200 bg-primary-50 hover:bg-primary-100'
                  }`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${getNotificationBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500"></span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
