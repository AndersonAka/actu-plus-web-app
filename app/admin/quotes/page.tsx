'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Card, EmptyState, Input, Select, Badge, Alert } from '@/components/atoms';
import {
  FileSpreadsheet, Search, X, Eye, Trash2, Building2, RefreshCw,
  Mail, Phone, Globe, Users, CheckCircle, AlertTriangle,
} from 'lucide-react';

interface QuoteRequest {
  id: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  numberOfAccess?: number;
  message?: string;
  status: 'pending' | 'contacted' | 'quoted' | 'closed';
  adminNotes?: string;
  enterpriseSubscriptionId?: string | null;
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

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'quoted', label: 'Devis envoyé' },
  { value: 'closed', label: 'Clôturé' },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Détail / mise à jour statut
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailStatus, setDetailStatus] = useState<QuoteRequest['status']>('pending');
  const [detailNotes, setDetailNotes] = useState('');
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  // Conversion en abonnement entreprise
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertForm, setConvertForm] = useState({ planId: '', maxSeats: 10, durationMonths: 12 });
  const [isConverting, setIsConverting] = useState(false);

  // Suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<QuoteRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/proxy/quotes?limit=100');
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        setQuotes(list);
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/proxy/subscriptions/plans?category=enterprise&all=true');
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;
        setPlans(
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : [],
        );
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    fetchPlans();
  }, [fetchQuotes, fetchPlans]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 5000);
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchSearch = !search ||
      q.companyName.toLowerCase().includes(search.toLowerCase()) ||
      `${q.firstName} ${q.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      q.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openDetail = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setDetailStatus(quote.status);
    setDetailNotes(quote.adminNotes || '');
    setError('');
    setShowDetailModal(true);
  };

  const handleSaveDetail = async () => {
    if (!selectedQuote) return;
    setIsSavingDetail(true);
    setError('');
    try {
      const response = await fetch(`/api/proxy/quotes/${selectedQuote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: detailStatus, adminNotes: detailNotes }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
      showSuccess('Demande mise à jour');
      setShowDetailModal(false);
      setSelectedQuote(null);
      fetchQuotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSavingDetail(false);
    }
  };

  const openConvert = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setConvertForm({
      planId: '',
      maxSeats: quote.numberOfAccess && quote.numberOfAccess > 0 ? quote.numberOfAccess : 10,
      durationMonths: 12,
    });
    setError('');
    setShowConvertModal(true);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    setIsConverting(true);
    setError('');
    try {
      if (!convertForm.planId) throw new Error('Veuillez sélectionner un plan');
      const response = await fetch(`/api/proxy/quotes/${selectedQuote.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertForm),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la conversion');
      }
      const referenceCode = data?.enterprise?.referenceCode;
      showSuccess(
        referenceCode
          ? `Abonnement créé ! Code de référence : ${referenceCode}`
          : 'Abonnement entreprise créé avec succès',
      );
      setShowConvertModal(false);
      setSelectedQuote(null);
      fetchQuotes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuote) return;
    setIsDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/proxy/quotes/${deletingQuote.id}`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
      showSuccess('Demande supprimée');
      setShowDeleteConfirm(false);
      setDeletingQuote(null);
      setQuotes((prev) => prev.filter((q) => q.id !== deletingQuote.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning" size="sm">En attente</Badge>;
      case 'contacted': return <Badge variant="info" size="sm">Contacté</Badge>;
      case 'quoted': return <Badge variant="info" size="sm">Devis envoyé</Badge>;
      case 'closed': return <Badge variant="success" size="sm">Clôturé</Badge>;
      default: return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultez les demandes de cotation entreprise et convertissez-les en abonnement.
        </p>
      </div>

      {success && <Alert variant="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && !showDetailModal && !showConvertModal && (
        <Alert variant="error" onClose={() => setError('')}>{error}</Alert>
      )}

      <Card>
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par entreprise, contact ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Effacer la recherche" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
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
              {filteredQuotes.length} résultat{filteredQuotes.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="h-12 w-12" />}
            title="Aucune demande de devis"
            description={search || statusFilter ? 'Aucun résultat pour ces filtres' : 'Les demandes de cotation apparaîtront ici'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Entreprise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Accès</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Reçue le</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{quote.companyName}</div>
                          {quote.country && <div className="text-xs text-gray-500">{quote.country}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{quote.firstName} {quote.lastName}</div>
                      <div className="text-xs text-gray-500">{quote.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{quote.numberOfAccess ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(quote.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(quote.status)}
                        {quote.enterpriseSubscriptionId && <Badge variant="success" size="sm">Converti</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(quote)} title="Voir / mettre à jour" className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        {!quote.enterpriseSubscriptionId && (
                          <button onClick={() => openConvert(quote)} title="Convertir en abonnement entreprise" className="rounded p-1.5 text-gray-500 hover:bg-green-50 hover:text-green-600">
                            <Building2 className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => { setDeletingQuote(quote); setShowDeleteConfirm(true); }} title="Supprimer" className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ==================== MODAL DÉTAIL ==================== */}
      {showDetailModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{selectedQuote.companyName}</h2>
              <button onClick={() => setShowDetailModal(false)} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Contact</p>
                  <p className="mt-1 font-medium text-gray-900">{selectedQuote.firstName} {selectedQuote.lastName}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" />Email</p>
                  <p className="mt-1 text-sm text-gray-700 break-all">{selectedQuote.email}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" />Téléphone</p>
                  <p className="mt-1 text-sm text-gray-700">{selectedQuote.phone}</p>
                </div>
                {selectedQuote.country && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Globe className="h-3 w-3" />Pays</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedQuote.country}</p>
                  </div>
                )}
                {selectedQuote.numberOfAccess != null && (
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Users className="h-3 w-3" />Accès souhaités</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedQuote.numberOfAccess}</p>
                  </div>
                )}
              </div>

              {selectedQuote.message && (
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs font-medium text-gray-500">Message</p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedQuote.message}</p>
                </div>
              )}

              {selectedQuote.enterpriseSubscriptionId && (
                <Alert variant="success">Ce devis a déjà été converti en abonnement entreprise.</Alert>
              )}

              <Select
                label="Statut"
                options={STATUS_OPTIONS}
                value={detailStatus}
                onChange={(e) => setDetailStatus(e.target.value as QuoteRequest['status'])}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes internes</label>
                <textarea
                  rows={3}
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                  placeholder="Notes pour le suivi commercial..."
                />
              </div>
            </div>
            <div className="flex justify-between gap-3 border-t border-gray-200 px-6 py-4">
              {!selectedQuote.enterpriseSubscriptionId ? (
                <Button variant="outline" onClick={() => { setShowDetailModal(false); openConvert(selectedQuote); }}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Convertir
                </Button>
              ) : <span />}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>Fermer</Button>
                <Button variant="primary" onClick={handleSaveDetail} isLoading={isSavingDetail}>Enregistrer</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CONVERSION ==================== */}
      {showConvertModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Convertir en abonnement entreprise</h2>
              <button onClick={() => setShowConvertModal(false)} aria-label="Fermer" className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleConvert} className="p-6">
              {error && <Alert variant="error" onClose={() => setError('')} className="mb-4">{error}</Alert>}
              <p className="mb-4 text-sm text-gray-600">
                Un abonnement entreprise sera créé pour <strong>{selectedQuote.companyName}</strong> et un
                code de référence sera envoyé à <strong>{selectedQuote.email}</strong>.
              </p>
              <div className="space-y-4">
                <Select
                  label="Plan d'abonnement"
                  options={[
                    { value: '', label: 'Sélectionner un plan...' },
                    ...plans.map(p => ({
                      value: p.id,
                      label: `${p.name} — ${p.price > 0 ? p.price.toLocaleString('fr-FR') + ' ' + p.currency : 'Sur devis'} / ${p.duration} mois`,
                    })),
                  ]}
                  value={convertForm.planId}
                  onChange={(e) => setConvertForm({ ...convertForm, planId: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre de places"
                    type="number"
                    min="1"
                    value={convertForm.maxSeats}
                    onChange={(e) => setConvertForm({ ...convertForm, maxSeats: parseInt(e.target.value) || 1 })}
                    required
                  />
                  <Input
                    label="Durée (mois)"
                    type="number"
                    min="1"
                    value={convertForm.durationMonths}
                    onChange={(e) => setConvertForm({ ...convertForm, durationMonths: parseInt(e.target.value) || 12 })}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowConvertModal(false)}>Annuler</Button>
                <Button type="submit" variant="primary" isLoading={isConverting}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Créer l'abonnement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMATION SUPPRESSION ==================== */}
      {showDeleteConfirm && deletingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Supprimer la demande</h3>
                  <p className="text-sm text-gray-500">{deletingQuote.companyName}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Cette demande de cotation sera définitivement supprimée. Cette action est irréversible.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDeletingQuote(null); }} disabled={isDeleting}>
                  Annuler
                </Button>
                <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
