'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { PublicShell } from '../PublicShell';
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
    <PublicShell>
      <div className="py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/profile"
            className="mb-6 inline-flex items-center gap-1 text-sm text-[#605d5d] hover:text-[#201e1d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au profil
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#ffe0d9]">
                <Shield className="h-6 w-6 text-[#ae1800]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">Sécurité</h1>
                <p className="text-[#605d5d]">Modifier votre mot de passe</p>
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
          <div className="border border-[#d7d3d3] bg-white p-6">
            <h2 className="mb-6 text-lg font-bold text-[#201e1d]">Changer le mot de passe</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="relative">
                <Input
                  label="Mot de passe actuel"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Saisissez votre mot de passe actuel"
                  className="rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-9 text-[#9b9797] hover:text-[#201e1d]"
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
                  className="rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-[#9b9797] hover:text-[#201e1d]"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {formData.newPassword.length > 0 && (
                <div className="border border-[#d7d3d3] bg-[#f8f4f4] p-4">
                  <p className="mb-2 text-sm font-semibold text-[#201e1d]">Critères du mot de passe :</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li
                        key={index}
                        className={`flex items-center gap-2 text-sm ${
                          req.test(formData.newPassword) ? 'text-[#ae1800]' : 'text-[#9b9797]'
                        }`}
                      >
                        <Check className={`h-4 w-4 ${req.test(formData.newPassword) ? 'text-[#ec3013]' : 'text-[#d7d3d3]'}`} />
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
                  className="rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-[#9b9797] hover:text-[#201e1d]"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword.length > 0 && !doPasswordsMatch && (
                  <p className="mt-1 text-sm text-[#ae1800]">Les mots de passe ne correspondent pas</p>
                )}
                {doPasswordsMatch && (
                  <p className="mt-1 text-sm text-[#166534]">Les mots de passe correspondent</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="modernist"
                  isLoading={isLoading}
                  disabled={!isPasswordValid || !doPasswordsMatch || !formData.currentPassword}
                >
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
