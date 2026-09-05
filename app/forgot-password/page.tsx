'use client';

import { useState } from 'react';
import { Archivo } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/atoms';
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

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '800'] });

const forgotPasswordSchema = z.object({
  email: z.string().email('Veuillez entrer une adresse email valide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
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
      // Rediriger vers l'écran de saisie du code OTP + nouveau mot de passe
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 1200);
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
      title: 'Code valide 15 minutes',
      description: 'Pour votre sécurité, le code expire après 15 minutes',
    },
    {
      icon: KeyRound,
      title: 'Mot de passe fort',
      description: 'Choisissez un mot de passe unique et sécurisé',
    },
  ];

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

          {isSubmitted ? (
            /* Success State */
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#f0fdf4]">
                <CheckCircle2 className="h-10 w-10 text-[#166534]" />
              </div>
              <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
                Code envoyé !
              </h1>
              <p className="mb-6 text-[#605d5d]">
                Si un compte existe avec l'adresse{' '}
                <span className="font-semibold text-[#201e1d]">{submittedEmail}</span>,
                vous recevrez un code de réinitialisation. Redirection en cours…
              </p>

              {/* Security Tips */}
              <div className="mb-6 space-y-3">
                {securityTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 border border-[#d7d3d3] bg-[#f8f4f4] p-3 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#ffe0d9]">
                      <tip.icon className="h-4 w-4 text-[#ec3013]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#201e1d]">{tip.title}</p>
                      <p className="text-xs text-[#9b9797]">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  variant="modernist-outline"
                  className="w-full justify-center"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail('');
                  }}
                >
                  Réessayer avec une autre adresse
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-center rounded-none">
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#ffe0d9]">
                  <KeyRound className="h-8 w-8 text-[#ec3013]" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">
                  Mot de passe oublié ?
                </h1>
                <p className="mt-2 text-[#605d5d]">
                  Pas de panique ! Entrez votre email et nous vous enverrons un code de réinitialisation.
                </p>
              </div>

              {error && (
                <Alert variant="error" className="mb-6 rounded-none" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#201e1d]">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9b9797]" />
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className={`w-full border py-3 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#ec3013]/20 ${
                        errors.email
                          ? 'border-[#ffc4b8] focus:border-[#ec3013]'
                          : 'border-[#d7d3d3] focus:border-[#ec3013]'
                      }`}
                      placeholder="votre@email.com"
                      autoFocus
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-[#ec3013]">{errors.email.message}</p>
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
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le code
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
                <Shield className="h-10 w-10" />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold">
                Sécurité renforcée
              </h2>
              <p className="text-lg text-[#bab6b6]">
                Votre sécurité est notre priorité. Le code de réinitialisation expire après 15 minutes pour protéger votre compte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
