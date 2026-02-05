'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header, Footer } from '@/components/organisms';
import { Button, Input, Alert } from '@/components/atoms';
import { User, Mail, Phone, Calendar, Crown, Heart, Archive, Bell, Shield, LogOut } from 'lucide-react';
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

  const subscription = (user as any)?.subscription;

  return (
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
                    onClick={() => router.push('/archives')}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Archive className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Mes Archives</p>
                      <p className="text-sm text-gray-500">Articles archivés</p>
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
                
                {subscription?.isActive ? (
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
