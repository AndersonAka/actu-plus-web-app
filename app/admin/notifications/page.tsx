'use client';

import { useState, useEffect } from 'react';
import { Card, EmptyState, Alert, Badge, Button } from '@/components/atoms';
import { Bell, Clock, User, FileText, CreditCard, UserPlus, CheckCircle, XCircle, Eye, EyeOff, Check } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface PaginatedResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type TabType = 'mine' | 'all';

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('mine');
  const [myNotifications, setMyNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<string>('');
  const [myTotal, setMyTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [myPage, setMyPage] = useState(1);
  const [allPage, setAllPage] = useState(1);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const fetchMyNotifications = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterType) params.append('type', filterType);
      if (filterRead) params.append('isRead', filterRead);

      const response = await fetch(`/api/proxy/notifications?${params}`);
      if (response.ok) {
        const result = await response.json();
        // Handle double-wrapped response: { success, data: { data: [...], total, ... } }
        const payload = result?.data ?? result;
        const notifications = Array.isArray(payload) 
          ? payload 
          : (payload?.data || []);
        const total = Array.isArray(payload) 
          ? payload.length 
          : (payload?.total || 0);
        setMyNotifications(notifications);
        setMyTotal(total);
      }
    } catch (err) {
      console.error('Error fetching my notifications:', err);
      setMyNotifications([]);
    }
  };

  const fetchAllNotifications = async (page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterType) params.append('type', filterType);
      if (filterRead) params.append('isRead', filterRead);

      const response = await fetch(`/api/proxy/notifications/all?${params}`);
      if (response.ok) {
        const result = await response.json();
        // Handle double-wrapped response: { success, data: { data: [...], total, ... } }
        const payload = result?.data ?? result;
        const notifications = Array.isArray(payload) 
          ? payload 
          : (payload?.data || []);
        const total = Array.isArray(payload) 
          ? payload.length 
          : (payload?.total || 0);
        setAllNotifications(notifications);
        setAllTotal(total);
      }
    } catch (err) {
      console.error('Error fetching all notifications:', err);
      setAllNotifications([]);
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchMyNotifications(myPage),
        fetchAllNotifications(allPage),
      ]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyNotifications(myPage);
    } else {
      fetchAllNotifications(allPage);
    }
  }, [filterType, filterRead, myPage, allPage, activeTab]);

  const markAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      const response = await fetch(`/api/proxy/notifications/${id}/read`, { method: 'PUT' });
      if (response.ok) {
        setMyNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
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
        setMyNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.startsWith('article')) return <FileText className="h-4 w-4" />;
    if (type.startsWith('subscription')) return <CreditCard className="h-4 w-4" />;
    if (type.startsWith('payment')) return <CreditCard className="h-4 w-4" />;
    if (type.startsWith('user')) return <UserPlus className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { variant: 'info' | 'warning' | 'success' | 'error'; label: string }> = {
      article_submitted: { variant: 'info', label: 'Article soumis' },
      article_approved: { variant: 'success', label: 'Article validé' },
      article_rejected: { variant: 'error', label: 'Article rejeté' },
      article_published: { variant: 'success', label: 'Article publié' },
      subscription_created: { variant: 'info', label: 'Abonnement créé' },
      subscription_activated: { variant: 'success', label: 'Abonnement activé' },
      subscription_expired: { variant: 'warning', label: 'Abonnement expiré' },
      subscription_cancelled: { variant: 'error', label: 'Abonnement annulé' },
      payment_success: { variant: 'success', label: 'Paiement réussi' },
      payment_failed: { variant: 'error', label: 'Paiement échoué' },
      user_registered: { variant: 'info', label: 'Inscription' },
      user_deactivated: { variant: 'warning', label: 'Compte désactivé' },
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
    { value: 'subscription_created', label: 'Abonnement créé' },
    { value: 'subscription_activated', label: 'Abonnement activé' },
    { value: 'subscription_expired', label: 'Abonnement expiré' },
    { value: 'subscription_cancelled', label: 'Abonnement annulé' },
    { value: 'payment_success', label: 'Paiement réussi' },
    { value: 'payment_failed', label: 'Paiement échoué' },
    { value: 'user_registered', label: 'Inscription' },
    { value: 'user_deactivated', label: 'Compte désactivé' },
  ];

  const renderNotificationList = (notifications: Notification[], showUser = false) => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return (
        <EmptyState
          title="Aucune notification"
          description="Aucune notification ne correspond à vos critères."
          icon={<Bell className="h-12 w-12 text-gray-400" />}
        />
      );
    }

    return (
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
                    {showUser && notif.user && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {notif.user.firstName} {notif.user.lastName}
                      </span>
                    )}
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
    );
  };

  const currentNotifications = activeTab === 'mine' ? myNotifications : allNotifications;
  const currentTotal = activeTab === 'mine' ? myTotal : allTotal;
  const currentPage = activeTab === 'mine' ? myPage : allPage;
  const setCurrentPage = activeTab === 'mine' ? setMyPage : setAllPage;
  const totalPages = Math.ceil(currentTotal / 20);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-1 text-gray-600">
          Consultez les notifications système générées automatiquement
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('mine')}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'mine'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Mes notifications
            {myTotal > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {myTotal}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Toutes les notifications
            {allTotal > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {allTotal}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Actions et Filtres */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {activeTab === 'mine' && myNotifications.some(n => !n.isRead) && (
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
      ) : (
        <>
          {renderNotificationList(currentNotifications, activeTab === 'all')}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({currentTotal} notifications)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
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
