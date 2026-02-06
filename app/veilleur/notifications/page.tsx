'use client';

import { useState, useEffect } from 'react';
import { Card, EmptyState, Alert, Badge, Button } from '@/components/atoms';
import { Bell, Clock, FileText, Eye, EyeOff, Check } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export default function VeilleurNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchNotifications = async (currentPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(currentPage), limit: '20' });
      if (filterType) params.append('type', filterType);
      if (filterRead) params.append('isRead', filterRead);

      const response = await fetch(`/api/proxy/notifications?${params}`);
      if (response.ok) {
        const result = await response.json();
        const payload = result?.data ?? result;
        const notifList = Array.isArray(payload) 
          ? payload 
          : (payload?.data || []);
        const notifTotal = Array.isArray(payload) 
          ? payload.length 
          : (payload?.total || 0);
        setNotifications(notifList);
        setTotal(notifTotal);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Erreur lors du chargement');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [filterType, filterRead, page]);

  const markAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      const response = await fetch(`/api/proxy/notifications/${id}/read`, { method: 'PUT' });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      const response = await fetch('/api/proxy/notifications/read-all', { method: 'PUT' });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.startsWith('article')) return <FileText className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: 'info' | 'warning' | 'success' | 'error'; label: string }> = {
      article_submitted: { variant: 'info', label: 'Article soumis' },
      article_approved: { variant: 'success', label: 'Article validé' },
      article_rejected: { variant: 'error', label: 'Article rejeté' },
      article_published: { variant: 'success', label: 'Article publié' },
      system: { variant: 'info', label: 'Système' },
    };
    const c = config[type] || { variant: 'info', label: type };
    return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
  };

  const notificationTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'article_submitted', label: 'Article soumis' },
    { value: 'article_approved', label: 'Article validé' },
    { value: 'article_rejected', label: 'Article rejeté' },
    { value: 'article_published', label: 'Article publié' },
  ];

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-gray-600">
          Suivez l'état de vos articles et les retours des modérateurs
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Actions et Filtres */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {notifications.some(n => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAllRead}
            leftIcon={<Check className="h-4 w-4" />}
          >
            {markingAllRead ? 'Marquage...' : 'Tout marquer comme lu'}
          </Button>
        )}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {notificationTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">Tous les statuts</option>
          <option value="false">Non lus</option>
          <option value="true">Lus</option>
        </select>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Aucune notification"
          description="Vous n'avez pas encore de notification."
          icon={<Bell className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 rounded-full p-2 ${!notif.isRead ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </h3>
                        {getTypeBadge(notif.type)}
                        {!notif.isRead && (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notif.message}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          {notif.isRead ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Lu
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Non lu
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        disabled={markingRead === notif.id}
                        className="ml-2 flex-shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {markingRead === notif.id ? (
                          <span className="flex items-center gap-1">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-primary-500" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Marquer lu
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} sur {totalPages} ({total} notifications)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
