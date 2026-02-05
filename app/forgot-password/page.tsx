'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input, Alert } from '@/components/atoms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  ArrowLeft,
  Send,
  CheckCircle2,
  Loader2,
  KeyRound,
  Shield,
  Smartphone,
} from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue');
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const securityTips = [
    {
      icon: Mail,
      title: 'Vérifiez vos spams',
      description: "L'email peut prendre quelques minutes à arriver",
    },
    {
      icon: Shield,
      title: 'Lien valide 1 heure',
      description: 'Pour votre sécurité, le lien expire après 1 heure',
    },
    {
      icon: KeyRound,
      title: 'Mot de passe fort',
      description: 'Choisissez un mot de passe unique et sécurisé',
    },
  ];

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

          {isSubmitted ? (
            /* Success State */
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Email envoyé !
              </h1>
              <p className="mb-6 text-gray-600">
                Si un compte existe avec l'adresse{' '}
                <span className="font-medium text-gray-900">{submittedEmail}</span>,
                vous recevrez un email avec les instructions de réinitialisation.
              </p>

              {/* Security Tips */}
              <div className="mb-6 space-y-3">
                {securityTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                      <tip.icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tip.title}</p>
                      <p className="text-xs text-gray-500">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail('');
                  }}
                >
                  Réessayer avec une autre adresse
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <KeyRound className="h-8 w-8 text-primary-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mot de passe oublié ?
                </h1>
                <p className="mt-2 text-gray-600">
                  Pas de panique ! Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
              </div>

              {error && (
                <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className={`w-full rounded-lg border py-3 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-primary-500'
                      }`}
                      placeholder="votre@email.com"
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>
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
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le lien
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
                <Shield className="h-10 w-10" />
              </div>
              <h2 className="mb-4 text-3xl font-bold">
                Sécurité renforcée
              </h2>
              <p className="text-lg text-primary-100">
                Votre sécurité est notre priorité. Le lien de réinitialisation expire après 1 heure pour protéger votre compte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
