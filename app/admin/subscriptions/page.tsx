'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, EmptyState, Badge, Select, Alert, Input } from '@/components/atoms';
import { Pagination } from '@/components/molecules';
import { CreditCard, CheckCircle, XCircle, Trash2, X, Plus, Pencil, Zap, Crown, Building2, LayoutList } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  category: 'standard' | 'enterprise';
  duration: number;
  price: number;
  currency: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  headcount?: number;
}

const PLAN_CATEGORY_LABELS: Record<string, string> = {
  standard: 'Particuliers Standard',
  enterprise: 'Entreprises',
};

const PLAN_CATEGORY_ICONS: Record<string, React.ReactElement> = {
  standard: <Zap className="h-4 w-4 text-gray-500" />,
  enterprise: <Building2 className="h-4 w-4 text-gray-700" />,
};

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

const EMPTY_PLAN_FORM = {
  id: '',
  name: '',
  category: 'standard' as 'standard' | 'enterprise',
  duration: 3,
  price: 0,
  currency: 'XOF',
  features: [''],
  isPopular: false,
  isActive: true,
  headcount: 5,
};

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'formulas'>('subscriptions');

  // ── Subscriptions state ──
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ active: 0, expired: 0, pending: 0, total: 0 });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Formulas state ──
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN_FORM);
  const [planSaving, setPlanSaving] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSuccess, setPlanSuccess] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

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

  // ── Formula management ──
  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await fetch('/api/proxy/subscriptions/plans?all=true');
      if (res.ok) {
        const data = await res.json();
        const list = data?.data ?? data;
        setPlans(Array.isArray(list) ? list : list?.data ?? []);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'formulas') fetchPlans();
  }, [activeTab]);

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm(EMPTY_PLAN_FORM);
    setShowPlanForm(true);
    setPlanError(null);
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      id: plan.id,
      name: plan.name,
      category: plan.category,
      duration: plan.duration,
      price: plan.price,
      currency: plan.currency,
      features: plan.features?.length ? plan.features : [''],
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      headcount: plan.headcount ?? 5,
    });
    setShowPlanForm(true);
    setPlanError(null);
  };

  const savePlan = async () => {
    setPlanSaving(true);
    setPlanError(null);
    try {
      // ── Client-side validation ──
      if (!planForm.name.trim()) {
        throw new Error('Veuillez saisir un nom pour la formule.');
      }
      if (Number(planForm.price) <= 0 && planForm.category !== 'enterprise') {
        throw new Error('Le prix doit être supérieur à 0.');
      }
      const isEnterprise = planForm.category === 'enterprise';
      if (isEnterprise) {
        if (!planForm.headcount || planForm.headcount < 1) {
          throw new Error('Veuillez indiquer le nombre de personnes pour cette formule entreprise.');
        }
        if (Number(planForm.price) <= 0) {
          throw new Error('Veuillez saisir le prix de la formule entreprise.');
        }
      }

      const payload: Record<string, any> = {
        name: planForm.name.trim(),
        category: planForm.category,
        duration: Number(planForm.duration),
        price: Number(planForm.price),
        currency: planForm.currency,
        features: planForm.features.filter((f) => f.trim() !== ''),
        isPopular: planForm.isPopular,
        isActive: planForm.isActive,
      };
      if (isEnterprise) {
        payload.headcount = planForm.headcount;
        // Duplicate check: same category + duration + headcount
        const duplicate = plans.find(
          p => p.category === 'enterprise'
            && p.duration === Number(planForm.duration)
            && p.headcount === planForm.headcount
            && p.id !== planForm.id
        );
        if (duplicate) {
          throw new Error(
            `Une formule entreprise pour ${planForm.headcount} personne(s) sur ${planForm.duration} mois existe déjà ("${duplicate.name}").`
          );
        }
      }
      const isEdit = Boolean(editingPlan);
      const url = isEdit
        ? `/api/proxy/subscriptions/plans/${editingPlan!.id}`
        : '/api/proxy/subscriptions/plans';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        // Translate common backend errors to friendly messages
        const raw = Array.isArray(data?.message) ? data.message.join(', ') : (data?.message || '');
        const friendly = raw.includes('not-null constraint')
          ? 'Certains champs obligatoires sont manquants. Veuillez vérifier le formulaire.'
          : raw.includes('duplicate key') || raw.includes('already exists')
            ? 'Une formule similaire existe déjà.'
            : raw.includes('should not exist')
              ? 'Le formulaire contient des champs non autorisés. Veuillez réessayer.'
              : raw || 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.';
        throw new Error(friendly);
      }
      setPlanSuccess(isEdit ? 'Formule modifiée avec succès' : 'Formule créée avec succès');
      setShowPlanForm(false);
      fetchPlans();
      setTimeout(() => setPlanSuccess(null), 3000);
    } catch (err: any) {
      setPlanError(err.message);
    } finally {
      setPlanSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Supprimer cette formule ?')) return;
    setDeletingPlanId(id);
    try {
      const res = await fetch(`/api/proxy/subscriptions/plans/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Erreur');
      }
      setPlanSuccess('Formule supprimée');
      fetchPlans();
      setTimeout(() => setPlanSuccess(null), 3000);
    } catch (err: any) {
      setPlanError(err.message);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...planForm.features];
    updated[index] = value;
    setPlanForm((f) => ({ ...f, features: updated }));
  };

  const addFeature = () => setPlanForm((f) => ({ ...f, features: [...f.features, ''] }));

  const removeFeature = (index: number) =>
    setPlanForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== index) }));

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
          <p className="mt-1 text-gray-600">Gérez les abonnements et les formules tarifaires</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'subscriptions' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutList className="h-4 w-4" />
          Abonnements
        </button>
        <button
          onClick={() => setActiveTab('formulas')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${activeTab === 'formulas' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard className="h-4 w-4" />
          Formules tarifaires
        </button>
      </div>

      {error && <Alert variant="error" className="mb-6" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* ── FORMULAS TAB ── */}
      {activeTab === 'formulas' && (
        <div>
          {planError && <Alert variant="error" className="mb-4" onClose={() => setPlanError(null)}>{planError}</Alert>}
          {planSuccess && <Alert variant="success" className="mb-4" onClose={() => setPlanSuccess(null)}>{planSuccess}</Alert>}

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Formules tarifaires</h2>
              <p className="text-sm text-gray-500">Configurez les formules Particuliers et Entreprises</p>
            </div>
            <Button variant="primary" onClick={openCreatePlan} leftIcon={<Plus className="h-4 w-4" />}>
              Nouvelle formule
            </Button>
          </div>

          {plansLoading ? (
            <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />)}</div>
          ) : (
            <>
              {/* Standard: card grid per plan */}
              {(['standard'] as const).map((cat) => {
                const catPlans = plans.filter(p => p.category === cat);
                return (
                  <div key={cat} className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                      {PLAN_CATEGORY_ICONS[cat]}
                      <h3 className="font-semibold text-gray-800">{PLAN_CATEGORY_LABELS[cat]}</h3>
                      <span className="ml-auto text-xs text-gray-400">{catPlans.length} formule(s)</span>
                    </div>
                    {catPlans.length === 0 ? (
                      <p className="rounded-lg bg-gray-50 py-6 text-center text-sm text-gray-400">Aucune formule configurée</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {catPlans.map(plan => (
                          <Card key={plan.id} padding="md" className="relative">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900">{plan.duration} mois</span>
                              <div className="flex gap-1">
                                {plan.isPopular && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">Populaire</span>}
                                {!plan.isActive && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inactif</span>}
                              </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900">
                              {`${Number(plan.price).toLocaleString('fr-FR')} FCFA`}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {(plan.features || []).slice(0, 3).map((f, i) => (
                                <li key={i} className="text-xs text-gray-500 truncate">• {f}</li>
                              ))}
                              {(plan.features || []).length > 3 && (
                                <li className="text-xs text-gray-400">+{plan.features.length - 3} autres</li>
                              )}
                            </ul>
                            <div className="mt-3 flex gap-2">
                              <button onClick={() => openEditPlan(plan)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800">
                                <Pencil className="h-3 w-3" /> Modifier
                              </button>
                              <button onClick={() => deletePlan(plan.id)} disabled={deletingPlanId === plan.id} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                                <Trash2 className="h-3 w-3" /> Supprimer
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Enterprise: dynamic pricing grid from saved plans */}
              {(() => {
                const entPlans = plans.filter(p => p.category === 'enterprise');
                // Build grid from saved enterprise plans: rows = headcount, columns = duration
                const headcountSet = [...new Set(entPlans.map(p => p.headcount ?? 0).filter(n => n > 0))].sort((a, b) => a - b);
                const durationSet = [...new Set(entPlans.map(p => p.duration))].sort((a, b) => a - b);
                // Build lookup: { headcount -> { duration -> plan } }
                const lookup: Record<number, Record<number, SubscriptionPlan>> = {};
                for (const p of entPlans) {
                  const hc = p.headcount ?? 0;
                  if (!lookup[hc]) lookup[hc] = {};
                  lookup[hc][p.duration] = p;
                }
                return (
                  <div className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                      {PLAN_CATEGORY_ICONS['enterprise']}
                      <h3 className="font-semibold text-gray-800">{PLAN_CATEGORY_LABELS['enterprise']}</h3>
                      <span className="ml-auto text-xs text-gray-400">{entPlans.length} formule(s)</span>
                    </div>

                    {/* Grille tarifaire dynamique */}
                    {headcountSet.length > 0 && durationSet.length > 0 ? (
                      <div className="mb-4 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="px-4 py-3 text-left font-medium text-gray-500">Personnes</th>
                              {durationSet.map(d => (
                                <th key={d} className="px-4 py-3 text-right font-medium text-gray-700">{d} mois</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {headcountSet.map(n => (
                              <tr key={n} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 font-medium text-gray-900">{n} pers.</td>
                                {durationSet.map(d => {
                                  const plan = lookup[n]?.[d];
                                  return (
                                    <td key={d} className="px-4 py-2.5 text-right text-gray-700">
                                      {plan
                                        ? `${Number(plan.price).toLocaleString('fr-FR')} FCFA`
                                        : <span className="text-gray-300">—</span>}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="mb-4 rounded-lg bg-gray-50 py-4 text-center text-sm text-gray-400">
                        Aucune formule entreprise configurée. Créez-en une pour voir la grille tarifaire.
                      </p>
                    )}

                    {/* Plan cards for edit/delete */}
                    {entPlans.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {entPlans.map(plan => (
                          <Card key={plan.id} padding="md" className="relative">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900">{plan.duration} mois</span>
                              <div className="flex gap-1">
                                {plan.isPopular && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">Populaire</span>}
                                {!plan.isActive && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Inactif</span>}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {plan.headcount ?? '–'} personne(s)
                            </p>
                            <p className="mt-1 text-lg font-bold text-gray-900">
                              {`${Number(plan.price).toLocaleString('fr-FR')} FCFA`}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {(plan.features || []).slice(0, 2).map((f, i) => (
                                <li key={i} className="text-xs text-gray-500 truncate">• {f}</li>
                              ))}
                            </ul>
                            <div className="mt-3 flex gap-2">
                              <button onClick={() => openEditPlan(plan)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800">
                                <Pencil className="h-3 w-3" /> Modifier
                              </button>
                              <button onClick={() => deletePlan(plan.id)} disabled={deletingPlanId === plan.id} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                                <Trash2 className="h-3 w-3" /> Supprimer
                              </button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {/* Plan Form Modal */}
          {showPlanForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingPlan ? 'Modifier la formule' : 'Nouvelle formule'}
                  </h2>
                  <button onClick={() => setShowPlanForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>

                {planError && <Alert variant="error" className="mb-4" onClose={() => setPlanError(null)}>{planError}</Alert>}

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie</label>
                      <select
                        value={planForm.category}
                        onChange={e => setPlanForm(f => ({ ...f, category: e.target.value as any }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                      >
                        <option value="standard">Particuliers Standard</option>
                        <option value="enterprise">Entreprises</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Durée (mois)</label>
                      <select
                        value={planForm.duration}
                        onChange={e => setPlanForm(f => ({ ...f, duration: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                      >
                        <option value={1}>1 mois</option>
                        <option value={3}>3 mois</option>
                        <option value={6}>6 mois</option>
                        <option value={12}>12 mois</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Prix (FCFA)</label>
                      <input
                        type="number"
                        value={planForm.price}
                        onChange={e => setPlanForm(f => ({ ...f, price: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                        placeholder="Ex: 3000"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Nom interne</label>
                      <input
                        type="text"
                        value={planForm.name}
                        onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                        placeholder="Ex: Standard 1 mois"
                      />
                    </div>
                  </div>

                  {/* Nombre de personnes — enterprise only */}
                  {planForm.category === 'enterprise' && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Nombre de personnes</label>
                      <input
                        type="number"
                        value={planForm.headcount}
                        onChange={e => setPlanForm(f => ({ ...f, headcount: Math.max(1, Number(e.target.value) || 1) }))}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                        placeholder="Ex: 5"
                        min={1}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Nombre exact de collaborateurs pour cette formule
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Avantages / Fonctionnalités</label>
                    <div className="space-y-2">
                      {planForm.features.map((feat, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={e => updateFeature(i, e.target.value)}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                            placeholder={`Avantage ${i + 1}`}
                          />
                          <button onClick={() => removeFeature(i)} className="text-gray-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addFeature} className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800">
                      <Plus className="h-4 w-4" /> Ajouter un avantage
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={planForm.isPopular} onChange={e => setPlanForm(f => ({ ...f, isPopular: e.target.checked }))} />
                      Populaire
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={planForm.isActive} onChange={e => setPlanForm(f => ({ ...f, isActive: e.target.checked }))} />
                      Actif
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowPlanForm(false)} disabled={planSaving}>Annuler</Button>
                  <Button variant="primary" onClick={savePlan} isLoading={planSaving}>
                    {editingPlan ? 'Enregistrer' : 'Créer'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === 'subscriptions' && (
      <div>
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
      )}
    </div>
  );
}
