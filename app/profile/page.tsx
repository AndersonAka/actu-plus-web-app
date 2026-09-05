'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { PublicShell } from '../PublicShell';
import { Button, Input, Alert } from '@/components/atoms';
import { User, Mail, Phone, Calendar, Crown, Heart, Bell, Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User as UserType } from '@/types';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

function userToFormData(u: Partial<UserType> | null | undefined): ProfileFormData {
  return {
    firstName: u?.firstName ?? '',
    lastName: u?.lastName ?? '',
    email: u?.email ?? '',
    phone: u?.phone ?? '',
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState<ProfileFormData>(userToFormData(null));
  const [savedUserData, setSavedUserData] = useState<ProfileFormData>(userToFormData(null));
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  // Charger le profil depuis l'API (données à jour, notamment après OAuth)
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await fetch('/api/proxy/auth/me', { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Impossible de charger le profil');
        }
        const profile = (await response.json()) as UserType;
        if (cancelled) return;

        const form = userToFormData(profile);
        setProfileUser(profile);
        if (!isEditing) {
          setUserData(form);
          setSavedUserData(form);
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err);
        if (!cancelled && user) {
          const form = userToFormData(user);
          setProfileUser(user);
          if (!isEditing) {
            setUserData(form);
            setSavedUserData(form);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  // Charger l'abonnement actif depuis l'API
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated) {
        setLoadingSubscription(false);
        return;
      }
      try {
        const response = await fetch('/api/proxy/subscriptions/active', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.hasActiveSubscription && data.subscription) {
            setSubscription(data.subscription);
          }
        }
      } catch (err) {
        console.error('Erreur chargement abonnement:', err);
      }
      setLoadingSubscription(false);
    };

    if (!authLoading) {
      fetchSubscription();
    }
  }, [isAuthenticated, authLoading]);

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Veuillez saisir votre mot de passe');
      return;
    }
    setIsDeletingAccount(true);
    setDeleteError(null);
    try {
      const response = await fetch('/api/proxy/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
      router.push('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Une erreur est survenue');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { email: _email, ...patchBody } = userData;

      const response = await fetch('/api/proxy/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patchBody),
      });

      const updated = await response.json();

      if (!response.ok) {
        throw new Error(updated.message || 'Erreur lors de la mise à jour du profil');
      }

      const form = userToFormData(updated as UserType);
      setUserData(form);
      setSavedUserData(form);
      setProfileUser(updated as UserType);
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
    <>
    <PublicShell>
      <div className="py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#201e1d]">Mon Profil</h1>
            <p className="mt-2 text-[#605d5d]">Gérez vos informations personnelles et préférences</p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="border border-[#d7d3d3] bg-white p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#201e1d]">Informations personnelles</h2>
                  {!isEditing ? (
                    <Button
                      variant="modernist-outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="modernist-outline"
                        size="sm"
                        onClick={() => {
                          setUserData(savedUserData);
                          setIsEditing(false);
                          setError(null);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="modernist"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isLoading}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  )}
                </div>

                {loadingProfile ? (
                  <div className="flex items-center gap-2 py-4 text-[#605d5d]">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#ffe0d9] border-t-[#ec3013]" />
                    <span className="text-sm">Chargement des informations…</span>
                  </div>
                ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Prénom"
                      leftIcon={<User className="h-5 w-5" />}
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20"
                    />
                    <Input
                      label="Nom"
                      leftIcon={<User className="h-5 w-5" />}
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20"
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    leftIcon={<Mail className="h-5 w-5" />}
                    value={userData.email}
                    disabled
                    className="rounded-none border-[#d7d3d3]"
                  />

                  <Input
                    label="Téléphone"
                    type="tel"
                    leftIcon={<Phone className="h-5 w-5" />}
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Optionnel"
                    className="rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20"
                  />

                </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border border-[#d7d3d3] bg-white p-6">
                <h2 className="mb-4 text-xl font-bold text-[#201e1d]">Accès rapide</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => router.push('/favorites')}
                    className="flex items-center gap-3 border border-[#d7d3d3] p-4 transition-colors hover:border-[#201e1d]/40 hover:bg-[#f8f4f4]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center bg-[#ffe0d9]">
                      <Heart className="h-5 w-5 text-[#ae1800]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#201e1d]">Mes Favoris</p>
                      <p className="text-sm text-[#605d5d]">Articles sauvegardés</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/notifications')}
                    className="flex items-center gap-3 border border-[#d7d3d3] p-4 transition-colors hover:border-[#201e1d]/40 hover:bg-[#f8f4f4]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center bg-[#ffe0d9]">
                      <Bell className="h-5 w-5 text-[#ae1800]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#201e1d]">Notifications</p>
                      <p className="text-sm text-[#605d5d]">Gérer les alertes</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/security')}
                    className="flex items-center gap-3 border border-[#d7d3d3] p-4 transition-colors hover:border-[#201e1d]/40 hover:bg-[#f8f4f4]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center bg-[#ffe0d9]">
                      <Shield className="h-5 w-5 text-[#ae1800]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#201e1d]">Sécurité</p>
                      <p className="text-sm text-[#605d5d]">Mot de passe</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Subscription & Stats */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <div className="bg-[#201e1d] p-6 text-white">
                <div className="mb-4 flex items-center gap-2">
                  <Crown className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Abonnement</h3>
                </div>

                {loadingSubscription ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <p className="text-sm text-[#bab6b6]">Chargement...</p>
                  </div>
                ) : subscription?.status === 'active' ? (
                  <>
                    <p className="mb-2 text-2xl font-extrabold">{subscription.plan?.name || 'Premium'}</p>
                    <p className="mb-4 text-sm text-[#bab6b6]">
                      Expire le {format(new Date(subscription.endDate), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                    <Button
                      variant="modernist-outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-[#201e1d]"
                      onClick={() => router.push('/subscriptions')}
                    >
                      Gérer l'abonnement
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-xl font-bold">Gratuit</p>
                    <p className="mb-4 text-sm text-[#bab6b6]">
                      Passez à Premium pour un accès illimité
                    </p>
                    <Button
                      variant="modernist-outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-[#201e1d]"
                      onClick={() => router.push('/subscriptions')}
                    >
                      Découvrir Premium
                    </Button>
                  </>
                )}
              </div>

              {/* Account Info */}
              <div className="border border-[#d7d3d3] bg-white p-6">
                <h3 className="mb-4 text-lg font-bold text-[#201e1d]">Informations du compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#605d5d]">Rôle</span>
                    <span className="font-semibold text-[#201e1d] capitalize">{user?.role || 'Utilisateur'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#605d5d]">Membre depuis</span>
                    <span className="font-semibold text-[#201e1d]">
                      {format(new Date((profileUser ?? user)?.createdAt || Date.now()), 'MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#605d5d]">Statut</span>
                    <span className="bg-[#dcfce7] px-2.5 py-0.5 text-xs font-semibold text-[#166534]">
                      Actif
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={async () => {
                  await fetch('/api/proxy/auth/logout', { method: 'POST' });
                  router.push('/login');
                }}
                className="flex w-full items-center justify-center gap-2 border border-[#ffc4b8] bg-white p-3 text-[#ae1800] transition-colors hover:bg-[#fff2ef]"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-semibold">Se déconnecter</span>
              </button>

              {/* Delete Account */}
              <div className="border border-[#ffc4b8] bg-[#fff2ef] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#ae1800]" />
                  <h3 className="font-bold text-[#ae1800]">Zone de danger</h3>
                </div>
                <p className="mb-3 text-sm text-[#7c1405]">
                  La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
                </p>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeleteError(null); setDeletePassword(''); }}
                  className="flex w-full items-center justify-center gap-2 border border-[#ae1800] bg-white p-2.5 text-sm font-semibold text-[#ae1800] transition-colors hover:bg-[#ae1800] hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>

    {/* Modal de confirmation de suppression */}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md border border-[#201e1d]/40 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-[#ffe0d9]">
              <AlertTriangle className="h-6 w-6 text-[#ae1800]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#201e1d]">Supprimer mon compte</h3>
              <p className="text-sm text-[#605d5d]">Cette action est irréversible</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-[#605d5d]">
            Vous êtes sur le point de supprimer définitivement votre compte et toutes vos données.
            Pour confirmer, entrez votre mot de passe.
          </p>

          {deleteError && (
            <div className="mb-4 border border-[#ffc4b8] bg-[#fff2ef] px-4 py-3 text-sm text-[#ae1800]">
              {deleteError}
            </div>
          )}

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-semibold text-[#201e1d]">
              Mot de passe
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
              placeholder="Votre mot de passe actuel"
              className="w-full rounded-none border border-[#d7d3d3] px-4 py-2.5 text-[#201e1d] focus:border-[#ae1800] focus:outline-none focus:ring-2 focus:ring-[#ae1800]/20"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
              disabled={isDeletingAccount}
              className="flex-1 border border-[#d7d3d3] bg-white px-4 py-2.5 text-sm font-semibold text-[#201e1d] transition-colors hover:bg-[#eae9e9] disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword.trim()}
              className="flex-1 bg-[#ae1800] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7c1405] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeletingAccount ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
