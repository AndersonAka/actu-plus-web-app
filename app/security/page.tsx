'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Header, Footer } from '@/components/organisms';
import { Button, Input, Alert } from '@/components/atoms';
import { Shield, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';

export default function SecurityPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/security');
    }
  }, [authLoading, isAuthenticated, router]);

  const passwordRequirements = [
    { label: 'Au moins 8 caractères', test: (p: string) => p.length >= 8 },
    { label: 'Une lettre majuscule', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Une lettre minuscule', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Un chiffre', test: (p: string) => /[0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test(formData.newPassword));
  const doPasswordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.currentPassword) {
      setError('Veuillez saisir votre mot de passe actuel');
      return;
    }

    if (!isPasswordValid) {
      setError('Le nouveau mot de passe ne respecte pas les critères requis');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/proxy/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }

      setSuccess('Mot de passe modifié avec succès !');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/profile"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sécurité</h1>
                <p className="text-gray-600">Modifier votre mot de passe</p>
              </div>
            </div>
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

          {/* Change Password Form */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">Changer le mot de passe</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="relative">
                <Input
                  label="Mot de passe actuel"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Saisissez votre mot de passe actuel"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <Input
                  label="Nouveau mot de passe"
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Saisissez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.newPassword.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Critères du mot de passe :</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-center gap-2 text-sm ${
                          req.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        <Check className={`h-4 w-4 ${req.test(formData.newPassword) ? 'text-green-500' : 'text-gray-300'}`} />
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  label="Confirmer le nouveau mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword.length > 0 && !doPasswordsMatch && (
                  <p className="mt-1 text-sm text-red-500">Les mots de passe ne correspondent pas</p>
                )}
                {doPasswordsMatch && (
                  <p className="mt-1 text-sm text-green-500">Les mots de passe correspondent</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={!isPasswordValid || !doPasswordsMatch || !formData.currentPassword}
                >
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
