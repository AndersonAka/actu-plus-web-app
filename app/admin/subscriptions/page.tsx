'use client';

import { useState, useEffect } from 'react';
import { Button, Card, EmptyState, Badge, Select, Alert } from '@/components/atoms';
import { Pagination } from '@/components/molecules';
import { CreditCard, CheckCircle, XCircle, Trash2, X } from 'lucide-react';

interface Subscription {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startDate?: string | null;
  endDate?: string | null;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ active: 0, expired: 0, pending: 0, total: 0 });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      let url = `/api/proxy/subscriptions?page=${currentPage}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url);
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;

        const nextSubscriptions =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.subscriptions)
                ? payload.subscriptions
                : [];

        const nextTotalPages =
          typeof payload?.totalPages === 'number'
            ? payload.totalPages
            : typeof payload?.data?.totalPages === 'number'
              ? payload.data.totalPages
              : 1;
        console.log(nextSubscriptions)
        setSubscriptions(nextSubscriptions);
        setTotalPages(nextTotalPages);
        setSelectedIds([]);
      }

      // Fetch stats
      const statsRes = await fetch('/api/proxy/subscriptions/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (sub: Subscription) => {
    setSubscriptionToDelete(sub);
    setShowDeleteConfirm(true);
  };

  const pendingIdsOnPage = subscriptions.filter((s) => s.status === 'pending').map((s) => s.id);
  const allPendingSelected = pendingIdsOnPage.length > 0 && pendingIdsOnPage.every((id) => selectedIds.includes(id));
  const somePendingSelected = pendingIdsOnPage.some((id) => selectedIds.includes(id));

  const toggleSelectAllPending = () => {
    if (allPendingSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pendingIdsOnPage.includes(id)));
      return;
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...pendingIdsOnPage])));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const closeBulkDeleteConfirm = () => {
    if (isBulkDeleting) return;
    setShowBulkDeleteConfirm(false);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkDeleting(true);
    setError(null);

    try {
      let deletedPaymentsTotal = 0;

      for (const id of selectedIds) {
        const response = await fetch(`/api/proxy/subscriptions/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Erreur lors de la suppression');
        }

        const result = await response.json().catch(() => null);
        if (typeof result?.deletedPaymentsCount === 'number') {
          deletedPaymentsTotal += result.deletedPaymentsCount;
        }
      }

      setSuccess(
        deletedPaymentsTotal > 0
          ? `Abonnements supprimés avec succès (${deletedPaymentsTotal} paiement(s) supprimé(s))`
          : 'Abonnements supprimés avec succès',
      );
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      fetchSubscriptions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
    setSubscriptionToDelete(null);
  };

  const confirmDelete = async () => {
    if (!subscriptionToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/proxy/subscriptions/${subscriptionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      const result = await response.json().catch(() => null);
      const deletedPaymentsCount = typeof result?.deletedPaymentsCount === 'number'
        ? result.deletedPaymentsCount
        : 0;

      setSuccess(
        deletedPaymentsCount > 0
          ? `Abonnement supprimé avec succès (${deletedPaymentsCount} paiement(s) supprimé(s))`
          : 'Abonnement supprimé avec succès',
      );
      closeDeleteConfirm();
      fetchSubscriptions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, statusFilter]);

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'active', label: 'Actif' },
    { value: 'expired', label: 'Expiré' },
    { value: 'cancelled', label: 'Annulé' },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'success' | 'error' | 'warning'; label: string }> = {
      pending: { variant: 'warning', label: 'En attente' },
      active: { variant: 'success', label: 'Actif' },
      expired: { variant: 'error', label: 'Expiré' },
      cancelled: { variant: 'warning', label: 'Annulé' },
    };
    const c = config[status] || { variant: 'warning', label: status };
    return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des abonnements</h1>
        <p className="mt-1 text-gray-600">Gérez les abonnements des utilisateurs</p>
      </div>

      {error && <Alert variant="error" className="mb-6" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>{success}</Alert>}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success-100 p-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Actifs</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning-100 p-2">
              <CreditCard className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-error-100 p-2">
              <XCircle className="h-5 w-5 text-error-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              <p className="text-sm text-gray-500">Expirés</p>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-100 p-2">
              <CreditCard className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6" padding="md">
        <div className="flex items-center gap-4">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-48"
          />

          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={openBulkDeleteConfirm}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer la sélection ({selectedIds.length})
            </Button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="Aucun abonnement"
          description="Les abonnements apparaîtront ici."
          icon={<CreditCard className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPendingSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !allPendingSelected && somePendingSelected;
                        }}
                        onChange={toggleSelectAllPending}
                        disabled={pendingIdsOnPage.length === 0}
                      />
                    </th>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Début</th>
                    <th className="px-4 py-3">Fin</th>
                    <th className="px-4 py-3">Montant</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(sub.id)}
                          onChange={() => toggleSelectOne(sub.id)}
                          disabled={sub.status !== 'pending'}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium">
                            {sub.user?.firstName?.[0]}{sub.user?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{sub.user?.firstName} {sub.user?.lastName}</p>
                            <p className="text-sm text-gray-500">{sub.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {sub.plan?.name
                          ? `${sub.plan.name}${sub.plan.price != null ? ` (${Number(sub.plan.price).toLocaleString('fr-FR')} FCFA)` : ''}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sub.startDate ? new Date(sub.startDate).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {sub.plan?.price != null
                          ? `${Number(sub.plan.price).toLocaleString('fr-FR')} FCFA`
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {sub.status === 'pending' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sub)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-error-600" />
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {showDeleteConfirm && subscriptionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Supprimer l'abonnement
              </h2>
              <button
                onClick={closeDeleteConfirm}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Voulez-vous vraiment supprimer cet abonnement en attente ?
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Si des paiements sont rattachés à cet abonnement, ils seront supprimés automatiquement.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeDeleteConfirm} disabled={isDeleting}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Supprimer la sélection
              </h2>
              <button
                onClick={closeBulkDeleteConfirm}
                className="text-gray-400 hover:text-gray-600"
                disabled={isBulkDeleting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Voulez-vous vraiment supprimer {selectedIds.length} abonnement(s) en attente ?
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Si des paiements sont rattachés à ces abonnements, ils seront supprimés automatiquement.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeBulkDeleteConfirm} disabled={isBulkDeleting}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmBulkDelete} isLoading={isBulkDeleting}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
