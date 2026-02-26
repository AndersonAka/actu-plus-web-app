'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header, Footer } from '@/components/organisms';
import { Button, Input, Alert } from '@/components/atoms';
import { User, Mail, Phone, Calendar, Crown, Heart, Bell, Shield, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
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

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

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
      const response = await fetch('/api/proxy/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

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
    <>
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            <p className="mt-2 text-gray-600">Gérez vos informations personnelles et préférences</p>
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
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setError(null);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isLoading}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Prénom"
                      leftIcon={<User className="h-5 w-5" />}
                      value={userData.firstName}
                      onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Nom"
                      leftIcon={<User className="h-5 w-5" />}
                      value={userData.lastName}
                      onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    leftIcon={<Mail className="h-5 w-5" />}
                    value={userData.email}
                    disabled
                  />

                  <Input
                    label="Téléphone"
                    type="tel"
                    leftIcon={<Phone className="h-5 w-5" />}
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Optionnel"
                  />

                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Accès rapide</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => router.push('/favorites')}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Mes Favoris</p>
                      <p className="text-sm text-gray-500">Articles sauvegardés</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/notifications')}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                      <Bell className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Notifications</p>
                      <p className="text-sm text-gray-500">Gérer les alertes</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/security')}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Sécurité</p>
                      <p className="text-sm text-gray-500">Mot de passe</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Subscription & Stats */}
            <div className="space-y-6">
              {/* Subscription Card */}
              <div className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 p-6 text-white shadow-lg">
                <div className="mb-4 flex items-center gap-2">
                  <Crown className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Abonnement</h3>
                </div>
                
                {loadingSubscription ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <p className="text-sm text-primary-100">Chargement...</p>
                  </div>
                ) : subscription?.status === 'active' ? (
                  <>
                    <p className="mb-2 text-2xl font-bold">{subscription.plan?.name || 'Premium'}</p>
                    <p className="mb-4 text-sm text-primary-100">
                      Expire le {format(new Date(subscription.endDate), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-primary-600"
                      onClick={() => router.push('/subscriptions')}
                    >
                      Gérer l'abonnement
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-xl font-semibold">Gratuit</p>
                    <p className="mb-4 text-sm text-primary-100">
                      Passez à Premium pour un accès illimité
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-primary-600"
                      onClick={() => router.push('/subscriptions')}
                    >
                      Découvrir Premium
                    </Button>
                  </>
                )}
              </div>

              {/* Account Info */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Informations du compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rôle</span>
                    <span className="font-medium text-gray-900 capitalize">{user?.role || 'Utilisateur'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Membre depuis</span>
                    <span className="font-medium text-gray-900">
                      {format(new Date((user as any)?.createdAt || Date.now()), 'MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Statut</span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white p-3 text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Se déconnecter</span>
              </button>

              {/* Delete Account */}
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Zone de danger</h3>
                </div>
                <p className="mb-3 text-sm text-red-700">
                  La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
                </p>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeleteError(null); setDeletePassword(''); }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-400 bg-white p-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>

    {/* Modal de confirmation de suppression */}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Supprimer mon compte</h3>
              <p className="text-sm text-gray-500">Cette action est irréversible</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Vous êtes sur le point de supprimer définitivement votre compte et toutes vos données.
            Pour confirmer, entrez votre mot de passe.
          </p>

          {deleteError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {deleteError}
            </div>
          )}

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDeleteAccount()}
              placeholder="Votre mot de passe actuel"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
              disabled={isDeletingAccount}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword.trim()}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
