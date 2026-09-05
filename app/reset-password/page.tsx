'use client';

import { useState, useEffect, Suspense } from 'react';
import { Archivo } from 'next/font/google';
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

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '800'] });

const resetPasswordSchema = z.object({
  code: z.string().optional(),
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
  const email = searchParams.get('email') || '';
  // Mode OTP si un email est fourni (nouveau flux), sinon mode lien token (rétrocompat)
  const isOtpMode = !token && !!email;

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
    setIsSubmitting(true);
    setError(null);

    try {
      if (isOtpMode) {
        const code = (data.code || '').trim();
        if (code.length !== 6) {
          setError('Veuillez saisir le code à 6 chiffres reçu par email');
          setIsSubmitting(false);
          return;
        }

        const response = await fetch('/api/proxy/auth/reset-password-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code, password: data.password }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Une erreur est survenue');
        }
      } else {
        const response = await fetch('/api/proxy/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: data.password }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Une erreur est survenue');
        }
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setError(null);
    try {
      await fetch('/api/proxy/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Réponse neutre : on n'expose rien
    }
  };

  // Ni token ni email → lien invalide
  if (!token && !email) {
    return (
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#fff2ef]">
          <AlertTriangle className="h-10 w-10 text-[#ec3013]" />
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
          Lien invalide
        </h1>
        <p className="mb-6 text-[#605d5d]">
          Le lien de réinitialisation est invalide ou a expiré.
          Veuillez faire une nouvelle demande.
        </p>
        <Link href="/forgot-password">
          <Button variant="modernist">
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
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#f0fdf4]">
            <CheckCircle2 className="h-10 w-10 text-[#166534]" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
            Mot de passe modifié !
          </h1>
          <p className="mb-6 text-[#605d5d]">
            Votre mot de passe a été réinitialisé avec succès.
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <Link href="/login">
            <Button variant="modernist" className="w-full justify-center">
              Se connecter
            </Button>
          </Link>
        </div>
      ) : (
        /* Form State */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#ffe0d9]">
              <KeyRound className="h-8 w-8 text-[#ec3013]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#201e1d]">
              Nouveau mot de passe
            </h1>
            <p className="mt-2 text-[#605d5d]">
              Créez un nouveau mot de passe sécurisé pour votre compte
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-6 rounded-none" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Code OTP (mode email) */}
            {isOtpMode && (
              <div>
                <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-[#201e1d]">
                  Code de vérification
                </label>
                <p className="mb-2 text-xs text-[#9b9797]">
                  Saisissez le code à 6 chiffres envoyé à{' '}
                  <span className="font-semibold text-[#605d5d]">{email}</span>
                </p>
                <input
                  type="text"
                  id="code"
                  inputMode="numeric"
                  maxLength={6}
                  {...register('code')}
                  className="w-full border border-[#d7d3d3] py-3 px-4 text-center text-lg tracking-[0.5em] font-semibold transition-colors focus:border-[#ec3013] focus:outline-none focus:ring-2 focus:ring-[#ec3013]/20"
                  placeholder="••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="mt-2 text-sm text-[#ec3013] hover:text-[#ae1800]"
                >
                  Renvoyer le code
                </button>
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#201e1d]">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9b9797]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  className={`w-full border py-3 pl-10 pr-12 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec3013]/20 ${
                    errors.password
                      ? 'border-[#ffc4b8] focus:border-[#ec3013]'
                      : 'border-[#d7d3d3] focus:border-[#ec3013]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9797] hover:text-[#605d5d]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-[#ec3013]">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 transition-colors ${
                          level <= strengthScore
                            ? strengthScore <= 2
                              ? 'bg-[#ec3013]'
                              : strengthScore === 3
                              ? 'bg-[#f2b705]'
                              : 'bg-[#166534]'
                            : 'bg-[#eae9e9]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className={passwordStrength.hasMinLength ? 'text-[#166534]' : 'text-[#9b9797]'}>
                      ✓ 8 caractères min
                    </span>
                    <span className={passwordStrength.hasUppercase ? 'text-[#166534]' : 'text-[#9b9797]'}>
                      ✓ Une majuscule
                    </span>
                    <span className={passwordStrength.hasLowercase ? 'text-[#166534]' : 'text-[#9b9797]'}>
                      ✓ Une minuscule
                    </span>
                    <span className={passwordStrength.hasNumber ? 'text-[#166534]' : 'text-[#9b9797]'}>
                      ✓ Un chiffre
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#201e1d]">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9b9797]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className={`w-full border py-3 pl-10 pr-12 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec3013]/20 ${
                    errors.confirmPassword
                      ? 'border-[#ffc4b8] focus:border-[#ec3013]'
                      : 'border-[#d7d3d3] focus:border-[#ec3013]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9797] hover:text-[#605d5d]"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-[#ec3013]">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="modernist"
              className="w-full justify-center"
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
              className="inline-flex items-center text-sm text-[#ec3013] hover:text-[#ae1800]"
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
    <div className={`${archivo.className} flex min-h-screen bg-[#f3f2f2] text-[#201e1d]`}>
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
                <Loader2 className="h-8 w-8 animate-spin text-[#ec3013]" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>

      {/* Right Section - Visual */}
      <div className="relative hidden w-0 flex-1 border-l-2 border-[#201e1d] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920&auto=format&fit=crop"
          alt="Background"
          fill
          className="object-cover"
          style={{ filter: 'grayscale(1) contrast(1.08)' }}
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-[#201e1d]/80">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="max-w-md text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center bg-white/10">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold">
                Créez un mot de passe fort
              </h2>
              <p className="text-lg text-[#bab6b6]">
                Un bon mot de passe contient des lettres majuscules et minuscules, des chiffres et des caractères spéciaux.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
