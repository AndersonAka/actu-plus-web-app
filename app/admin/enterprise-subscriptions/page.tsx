'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, EmptyState, Input, Select, Badge, Alert } from '@/components/atoms';
import {
  Building2, Plus, Users, Calendar, CheckCircle, XCircle, Edit2, Eye,
  Search, X, UserMinus, AlertTriangle, Phone, Mail, RefreshCw,
} from 'lucide-react';

interface EnterpriseSubscription {
  id: string;
  companyName: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  referenceCode: string;
  plan: {
    id: string;
    name: string;
    category: string;
  };
  planId: string;
  maxSeats: number;
  usedSeats: number;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface EnterpriseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  currency: string;
}

interface CreateFormData {
  companyName: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  planId: string;
  maxSeats: number;
  durationMonths: number;
}

interface EditFormData {
  companyName: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  maxSeats: number;
}

const initialCreateFormData: CreateFormData = {
  companyName: '',
  contactEmail: '',
  contactName: '',
  contactPhone: '',
  planId: '',
  maxSeats: 10,
  durationMonths: 12,
};

export default function EnterpriseSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<EnterpriseSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal création
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormData>(initialCreateFormData);
  const [isCreating, setIsCreating] = useState(false);

  // Modal édition
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<EnterpriseSubscription | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({ companyName: '', contactEmail: '', contactName: '', contactPhone: '', maxSeats: 10 });
  const [isEditing, setIsEditing] = useState(false);

  // Modal détail
  const [selectedSubscription, setSelectedSubscription] = useState<EnterpriseSubscription | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [enterpriseUsers, setEnterpriseUsers] = useState<EnterpriseUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Confirmation annulation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState<EnterpriseSubscription | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Confirmation retrait employé
  const [showRemoveUserConfirm, setShowRemoveUserConfirm] = useState(false);
  const [removingUser, setRemovingUser] = useState<EnterpriseUser | null>(null);
  const [isRemovingUser, setIsRemovingUser] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy/subscriptions/enterprise');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching enterprise subscriptions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/proxy/subscriptions/plans?category=enterprise&all=true');
      if (response.ok) {
        const data = await response.json();
        setPlans(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, [fetchSubscriptions, fetchPlans]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  // ---- Filtrage local ----
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchSearch = !search ||
      sub.companyName.toLowerCase().includes(search.toLowerCase()) ||
      sub.contactName.toLowerCase().includes(search.toLowerCase()) ||
      sub.referenceCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ---- Création ----
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    try {
      if (!createForm.planId) throw new Error('Veuillez sélectionner un plan');
      const response = await fetch('/api/proxy/subscriptions/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la création');
      }
      const result = await response.json();
      showSuccess(`Abonnement créé ! Code de référence : ${result.referenceCode}`);
      setShowCreateModal(false);
      setCreateForm(initialCreateFormData);
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // ---- Édition ----
  const openEditModal = (sub: EnterpriseSubscription) => {
    setEditingSubscription(sub);
    setEditForm({
      companyName: sub.companyName,
      contactEmail: sub.contactEmail,
      contactName: sub.contactName,
      contactPhone: sub.contactPhone || '',
      maxSeats: sub.maxSeats,
    });
    setError('');
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;
    setIsEditing(true);
    setError('');
    try {
      const response = await fetch(`/api/proxy/subscriptions/enterprise/${editingSubscription.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la modification');
      }
      showSuccess('Abonnement modifié avec succès');
      setShowEditModal(false);
      setEditingSubscription(null);
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // ---- Annulation ----
  const openCancelConfirm = (sub: EnterpriseSubscription) => {
    setCancellingSubscription(sub);
    setShowCancelConfirm(true);
  };

  const handleCancel = async () => {
    if (!cancellingSubscription) return;
    setIsCancelling(true);
    setError('');
    try {
      const response = await fetch(`/api/proxy/subscriptions/enterprise/${cancellingSubscription.id}/cancel`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de l\'annulation');
      }
      showSuccess('Abonnement annulé avec succès');
      setShowCancelConfirm(false);
      setCancellingSubscription(null);
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  // ---- Détail & utilisateurs ----
  const viewDetails = async (sub: EnterpriseSubscription) => {
    setSelectedSubscription(sub);
    setShowDetailModal(true);
    setLoadingUsers(true);
    try {
      const response = await fetch(`/api/proxy/subscriptions/enterprise/${sub.id}/users`);
      if (response.ok) {
        const users = await response.json();
        setEnterpriseUsers(Array.isArray(users) ? users : []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSubscription(null);
    setEnterpriseUsers([]);
  };

  // ---- Retrait employé ----
  const openRemoveUserConfirm = (user: EnterpriseUser) => {
    setRemovingUser(user);
    setShowRemoveUserConfirm(true);
  };

  const handleRemoveUser = async () => {
    if (!removingUser || !selectedSubscription) return;
    setIsRemovingUser(true);
    setError('');
    try {
      const response = await fetch(
        `/api/proxy/subscriptions/enterprise/${selectedSubscription.id}/users/${removingUser.id}`,
        { method: 'DELETE' }
      );
      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors du retrait');
      }
      showSuccess(`${removingUser.firstName} ${removingUser.lastName} retiré de l'entreprise`);
      setShowRemoveUserConfirm(false);
      setRemovingUser(null);
      setEnterpriseUsers((prev) => prev.filter((u) => u.id !== removingUser.id));
      setSelectedSubscription((prev) => prev ? { ...prev, usedSeats: Math.max(0, prev.usedSeats - 1) } : null);
      fetchSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRemovingUser(false);
    }
  };

  // ---- Helpers UI ----
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success" size="sm">Actif</Badge>;
      case 'expired': return <Badge variant="error" size="sm">Expiré</Badge>;
      case 'cancelled': return <Badge variant="default" size="sm">Annulé</Badge>;
      default: return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const seatsPercent = (used: number, max: number) => Math.round((used / max) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comptes Entreprise</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les abonnements enterprise, leurs employés et codes de référence
          </p>
        </div>
        {/* <Button
          variant="primary"
          onClick={() => { setShowCreateModal(true); setError(''); }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvel abonnement
        </Button> */}
      </div>

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && !showCreateModal && !showEditModal && (
        <Alert variant="error" onClose={() => setError('')}>{error}</Alert>
      )}

      {/* Tableau */}
      <Card>
        {/* Barre filtres */}
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, contact ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="expired">Expirés</option>
              <option value="cancelled">Annulés</option>
            </select>
            {(search || statusFilter) && (
              <button
                onClick={() => { setSearch(''); setStatusFilter(''); }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
            <span className="text-sm text-gray-400">
              {filteredSubscriptions.length} résultat{filteredSubscriptions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title="Aucun abonnement enterprise"
            description={search || statusFilter ? 'Aucun résultat pour ces filtres' : 'Créez votre premier abonnement enterprise'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entreprise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Places</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Période</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{sub.companyName}</div>
                          <div className="text-xs text-gray-500">{sub.contactName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-primary-600">
                        {sub.referenceCode}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sub.plan?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="w-28">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-900">{sub.usedSeats} / {sub.maxSeats}</span>
                          {sub.usedSeats >= sub.maxSeats && <Badge variant="error" size="sm">Complet</Badge>}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-200">
                          <div
                            className={`h-1.5 rounded-full transition-all ${seatsPercent(sub.usedSeats, sub.maxSeats) >= 90 ? 'bg-red-500' : seatsPercent(sub.usedSeats, sub.maxSeats) >= 60 ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, seatsPercent(sub.usedSeats, sub.maxSeats))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{formatDate(sub.startDate)}</div>
                      <div className="text-xs text-gray-400">→ {formatDate(sub.endDate)}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(sub.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => viewDetails(sub)}
                          title="Voir les détails"
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(sub)}
                          title="Modifier"
                          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {sub.status === 'active' && (
                          <button
                            onClick={() => openCancelConfirm(sub)}
                            title="Annuler l'abonnement"
                            className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ==================== MODAL CRÉATION ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Nouvel abonnement enterprise</h2>
              <button onClick={() => { setShowCreateModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              {error && <Alert variant="error" onClose={() => setError('')} className="mb-4">{error}</Alert>}
              <div className="space-y-4">
                <Input
                  label="Nom de l'entreprise"
                  value={createForm.companyName}
                  onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nom du contact"
                    value={createForm.contactName}
                    onChange={(e) => setCreateForm({ ...createForm, contactName: e.target.value })}
                    required
                  />
                  <Input
                    label="Téléphone du contact"
                    value={createForm.contactPhone}
                    onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                  />
                </div>
                <Input
                  label="Email du contact"
                  type="email"
                  value={createForm.contactEmail}
                  onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
                  required
                />
                <Select
                  label="Plan d'abonnement"
                  options={[
                    { value: '', label: 'Sélectionner un plan...' },
                    ...plans.map(p => ({
                      value: p.id,
                      label: `${p.name} — ${p.price > 0 ? p.price.toLocaleString('fr-FR') + ' ' + p.currency : 'Sur devis'} / ${p.duration} mois`,
                    })),
                  ]}
                  value={createForm.planId}
                  onChange={(e) => setCreateForm({ ...createForm, planId: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre de places"
                    type="number"
                    min="1"
                    value={createForm.maxSeats}
                    onChange={(e) => setCreateForm({ ...createForm, maxSeats: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <Input
                    label="Durée (mois)"
                    type="number"
                    min="1"
                    value={createForm.durationMonths}
                    onChange={(e) => setCreateForm({ ...createForm, durationMonths: parseInt(e.target.value) || 12 })}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setError(''); }}>Annuler</Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>Créer</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL ÉDITION ==================== */}
      {showEditModal && editingSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Modifier l'abonnement</h2>
              <button onClick={() => { setShowEditModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6">
              {error && <Alert variant="error" onClose={() => setError('')} className="mb-4">{error}</Alert>}
              <div className="space-y-4">
                <Input
                  label="Nom de l'entreprise"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nom du contact"
                    value={editForm.contactName}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    required
                  />
                  <Input
                    label="Téléphone"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                  />
                </div>
                <Input
                  label="Email du contact"
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
                  required
                />
                <Input
                  label="Nombre de places maximum"
                  type="number"
                  min={editingSubscription.usedSeats}
                  value={editForm.maxSeats}
                  onChange={(e) => setEditForm({ ...editForm, maxSeats: parseInt(e.target.value) || 1 })}
                  required
                />
                <p className="text-xs text-gray-500">
                  Places actuellement utilisées : <strong>{editingSubscription.usedSeats}</strong> — le nombre de places ne peut pas être inférieur à ce chiffre.
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setError(''); }}>Annuler</Button>
                <Button type="submit" variant="primary" isLoading={isEditing}>Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMATION ANNULATION ==================== */}
      {showCancelConfirm && cancellingSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Annuler l'abonnement</h3>
                  <p className="text-sm text-gray-500">{cancellingSubscription.companyName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Voulez-vous vraiment annuler cet abonnement enterprise ? Les <strong>{cancellingSubscription.usedSeats} employé(s)</strong> inscrits perdront leur accès.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowCancelConfirm(false); setCancellingSubscription(null); }} disabled={isCancelling}>
                  Annuler
                </Button>
                <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
                  Confirmer l'annulation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL DÉTAIL ==================== */}
      {showDetailModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedSubscription.companyName}</h2>
                  <div className="flex items-center gap-2">{getStatusBadge(selectedSubscription.status)}</div>
                </div>
              </div>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Infos principales */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Code référence</p>
                  <code className="mt-1 block text-base font-mono font-semibold text-primary-600">{selectedSubscription.referenceCode}</code>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Plan</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedSubscription.plan?.name || '-'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Places utilisées</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedSubscription.usedSeats} / {selectedSubscription.maxSeats}</p>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-1.5 rounded-full ${seatsPercent(selectedSubscription.usedSeats, selectedSubscription.maxSeats) >= 90 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, seatsPercent(selectedSubscription.usedSeats, selectedSubscription.maxSeats))}%` }}
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Contact</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedSubscription.contactName}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" />Email</p>
                  <p className="mt-1 text-sm text-gray-700 break-all">{selectedSubscription.contactEmail}</p>
                </div>
                {selectedSubscription.contactPhone && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />Téléphone</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedSubscription.contactPhone}</p>
                  </div>
                )}
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Début</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedSubscription.startDate)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Fin</p>
                  <p className="mt-1 text-sm text-gray-700">{formatDate(selectedSubscription.endDate)}</p>
                </div>
              </div>

              {/* Liste des employés */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <Users className="h-5 w-5 text-gray-400" />
                  Employés inscrits
                  <Badge variant="default" size="sm">{enterpriseUsers.length}</Badge>
                </h3>
                {loadingUsers ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />)}
                  </div>
                ) : enterpriseUsers.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    Aucun employé inscrit pour le moment
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enterpriseUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
                              {user.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</span>}
                              <span>Inscrit le {formatDate(user.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <Badge variant="success" size="sm">Actif</Badge>
                          ) : (
                            <Badge variant="error" size="sm">Inactif</Badge>
                          )}
                          {selectedSubscription.status === 'active' && (
                            <button
                              onClick={() => openRemoveUserConfirm(user)}
                              title="Retirer de l'entreprise"
                              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <Button variant="outline" onClick={() => { closeDetailModal(); openEditModal(selectedSubscription); }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button variant="outline" onClick={closeDetailModal}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMATION RETRAIT EMPLOYÉ ==================== */}
      {showRemoveUserConfirm && removingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <UserMinus className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Retirer l'employé</h3>
                  <p className="text-sm text-gray-500">{removingUser.firstName} {removingUser.lastName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Cet employé sera retiré de l'abonnement enterprise. Son accès premium sera révoqué et une place sera libérée.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowRemoveUserConfirm(false); setRemovingUser(null); }} disabled={isRemovingUser}>
                  Annuler
                </Button>
                <Button variant="danger" onClick={handleRemoveUser} isLoading={isRemovingUser}>
                  Retirer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
