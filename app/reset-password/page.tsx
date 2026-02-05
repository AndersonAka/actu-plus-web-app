'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Alert } from '@/components/atoms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no token, show error
  if (!token) {
    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Lien invalide
        </h1>
        <p className="mb-6 text-gray-600">
          Le lien de réinitialisation est invalide ou a expiré.
          Veuillez faire une nouvelle demande.
        </p>
        <Link href="/forgot-password">
          <Button variant="primary">
            Nouvelle demande
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {isSubmitted ? (
        /* Success State */
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Mot de passe modifié !
          </h1>
          <p className="mb-6 text-gray-600">
            Votre mot de passe a été réinitialisé avec succès.
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Se connecter
            </Button>
          </Link>
        </div>
      ) : (
        /* Form State */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <KeyRound className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nouveau mot de passe
            </h1>
            <p className="mt-2 text-gray-600">
              Créez un nouveau mot de passe sécurisé pour votre compte
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  className={`w-full rounded-lg border py-3 pl-10 pr-12 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= strengthScore
                            ? strengthScore <= 2
                              ? 'bg-red-500'
                              : strengthScore === 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                      ✓ 8 caractères min
                    </span>
                    <span className={passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Une majuscule
                    </span>
                    <span className={passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Une minuscule
                    </span>
                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                      ✓ Un chiffre
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className={`w-full rounded-lg border py-3 pl-10 pr-12 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification en cours...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Section - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/images/logo-actu-plus.webp"
                alt="Actu Plus"
                width={150}
                height={50}
                priority
                className="h-12 w-auto"
                unoptimized={true}
              />
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>

      {/* Right Section - Visual */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920&auto=format&fit=crop"
          alt="Background"
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-900/95">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h2 className="mb-4 text-3xl font-bold">
                Créez un mot de passe fort
              </h2>
              <p className="text-lg text-primary-100">
                Un bon mot de passe contient des lettres majuscules et minuscules, des chiffres et des caractères spéciaux.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
