'use client';

import { useState, useEffect } from 'react';
import { Button, Card, EmptyState, Input, Select, Badge, Alert } from '@/components/atoms';
import { Pagination } from '@/components/molecules';
import { User } from '@/types';
import { Search, Users, Mail, Phone, Plus, Edit2, UserX, UserCheck, X, Eye, Calendar, CreditCard } from 'lucide-react';

interface UserFormData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  civility: string;
  password: string;
  role: string;
}

const initialFormData: UserFormData = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  civility: 'M.',
  password: '',
  role: 'manager',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let url = `/api/proxy/users?page=${currentPage}&limit=10`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await fetch(url);
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;

        const nextUsers =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.users)
                ? payload.users
                : [];

        setUsers(nextUsers);

        const nextTotalPages =
          typeof payload?.totalPages === 'number'
            ? payload.totalPages
            : 1;
        setTotalPages(nextTotalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      phone: user.phone || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      civility: user.civility || 'M.',
      password: '',
      role: user.role || 'manager',
    });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        const updateData: Record<string, string> = {};
        if (formData.firstName !== editingUser.firstName) updateData.firstName = formData.firstName;
        if (formData.lastName !== editingUser.lastName) updateData.lastName = formData.lastName;
        if (formData.email !== editingUser.email) updateData.email = formData.email;
        if (formData.phone !== editingUser.phone) updateData.phone = formData.phone;
        if (formData.civility !== editingUser.civility) updateData.civility = formData.civility;
        if (formData.role !== editingUser.role) updateData.role = formData.role;

        const response = await fetch(`/api/proxy/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Erreur lors de la modification');
        }

        setSuccess('Utilisateur modifié avec succès');
      } else {
        if (!formData.password || formData.password.length < 8) {
          throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }

        const response = await fetch('/api/proxy/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Erreur lors de la création");
        }

        setSuccess('Utilisateur créé avec succès');
      }

      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailModal = async (user: User) => {
    setDetailUser(user);
    setShowDetailModal(true);
    setLoadingSubscriptions(true);

    try {
      const response = await fetch(`/api/proxy/subscriptions?userId=${user.id}`);
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;
        const subs = Array.isArray(payload) ? payload : (payload?.data || []);
        setUserSubscriptions(subs);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailUser(null);
    setUserSubscriptions([]);
  };

  const updateUserActiveState = async (user: User, nextIsActive: boolean) => {
    const response = await fetch(`/api/proxy/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextIsActive }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Erreur lors de la modification');
    }

    setSuccess(`Utilisateur ${nextIsActive ? 'activé' : 'désactivé'} avec succès`);
    fetchUsers();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleToggleActive = async (user: User) => {
    if (user.isActive) {
      setUserToDeactivate(user);
      setShowDeactivateConfirm(true);
      return;
    }

    try {
      await updateUserActiveState(user, true);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const closeDeactivateConfirm = () => {
    if (isDeactivating) return;
    setShowDeactivateConfirm(false);
    setUserToDeactivate(null);
  };

  const confirmDeactivation = async () => {
    if (!userToDeactivate) return;

    setIsDeactivating(true);
    setError('');
    try {
      await updateUserActiveState(userToDeactivate, false);
      setShowDeactivateConfirm(false);
      setUserToDeactivate(null);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsDeactivating(false);
    }
  };

  const roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'user', label: 'Utilisateur' },
    { value: 'veilleur', label: 'Veilleur' },
    { value: 'manager', label: 'Modérateur' },
    { value: 'admin', label: 'Admin' },
  ];

  const roleFormOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'veilleur', label: 'Veilleur' },
    { value: 'manager', label: 'Modérateur' },
  ];

  const effectiveRoleFormOptions =
    editingUser?.role && !roleFormOptions.some((o) => o.value === editingUser.role)
      ? [{ value: editingUser.role, label: editingUser.role === 'user' ? 'Utilisateur' : editingUser.role }, ...roleFormOptions]
      : roleFormOptions;

  const civilityOptions = [
    { value: 'M.', label: 'M.' },
    { value: 'Mme', label: 'Mme' },
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'; label: string }> = {
      admin: { variant: 'error', label: 'Admin' },
      manager: { variant: 'warning', label: 'Manager' },
      veilleur: { variant: 'primary', label: 'Veilleur' },
      user: { variant: 'default', label: 'Utilisateur' },
    };
    const config = roleConfig[role] || { variant: 'default', label: role };
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="mt-1 text-gray-600">Gérez les utilisateurs de la plateforme</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}
      {error && !showModal && <Alert variant="error" className="mb-4">{error}</Alert>}

      <Card className="mb-6" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
          <div className='flex flex-col gap-4 sm:flex-row justify-'>
            <Input
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-3 text-base"
              leftIcon={<Search className="h-5 w-5" />}
            />
            <div>
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="sm:w-48"
              />
            </div>
            <Button type="submit" variant="primary">Rechercher</Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="Aucun utilisateur trouvé"
          description="Modifiez vos filtres de recherche."
          icon={<Users className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Inscription</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <Badge variant="success" size="sm">Actif</Badge>
                        ) : (
                          <Badge variant="error" size="sm">Inactif</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {user.role === 'user' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailModal(user)}
                              title="Voir détail"
                            >
                              <Eye className="h-4 w-4 text-primary-600" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(user)}
                              title="Modifier"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                            title={user.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4 text-error-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-success-600" />
                            )}
                          </Button>
                        </div>
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

      {showDetailModal && detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Détail de l'utilisateur
              </h2>
              <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xl font-medium">
                  {detailUser.firstName?.[0]}{detailUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {detailUser.firstName} {detailUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{getRoleBadge(detailUser.role)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{detailUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{detailUser.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Inscrit le {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString('fr-FR') : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {detailUser.isActive ? (
                    <Badge variant="success" size="sm">Actif</Badge>
                  ) : (
                    <Badge variant="error" size="sm">Inactif</Badge>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                  <CreditCard className="h-5 w-5" />
                  Historique des abonnements
                </h4>

                {loadingSubscriptions ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
                    ))}
                  </div>
                ) : userSubscriptions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Aucun abonnement trouvé</p>
                ) : (
                  <div className="space-y-3">
                    {userSubscriptions.map((sub: any) => (
                      <div key={sub.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{sub.plan?.name || 'Plan inconnu'}</p>
                            <p className="text-sm text-gray-500">
                              {sub.startDate ? new Date(sub.startDate).toLocaleDateString('fr-FR') : '-'}
                              {' → '}
                              {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : '-'}
                            </p>
                          </div>
                          <Badge
                            variant={
                              sub.status === 'active' ? 'success' :
                              sub.status === 'expired' ? 'error' :
                              sub.status === 'cancelled' ? 'warning' : 'default'
                            }
                            size="sm"
                          >
                            {sub.status === 'active' ? 'Actif' :
                             sub.status === 'expired' ? 'Expiré' :
                             sub.status === 'cancelled' ? 'Annulé' :
                             sub.status === 'pending' ? 'En attente' : sub.status}
                          </Badge>
                        </div>
                        {sub.plan?.price && (
                          <p className="mt-1 text-sm text-gray-600">
                            {sub.plan.price.toLocaleString('fr-FR')} FCFA / {sub.plan.duration} mois
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={closeDetailModal}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeactivateConfirm && userToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmer la désactivation
              </h2>
              <button
                onClick={closeDeactivateConfirm}
                className="text-gray-400 hover:text-gray-600"
                disabled={isDeactivating}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Voulez-vous vraiment désactiver
              <span className="font-medium text-gray-900">{' '}
                {`${userToDeactivate.firstName || ''} ${userToDeactivate.lastName || ''}`.trim() || userToDeactivate.email}
              </span>
              {' '}?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeDeactivateConfirm} disabled={isDeactivating}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDeactivation} isLoading={isDeactivating}>
                Désactiver
              </Button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <Alert variant="error" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Civilité"
                  options={civilityOptions}
                  value={formData.civility}
                  onChange={(e) => setFormData({ ...formData, civility: e.target.value })}
                />
                <Select
                  label="Rôle"
                  options={effectiveRoleFormOptions}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+221771234567"
              />

              {!editingUser && (
                <div>
                  <Input
                    label="Mot de passe"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : editingUser ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
