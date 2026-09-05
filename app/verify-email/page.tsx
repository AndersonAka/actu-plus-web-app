'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Archivo } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '800'] });

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (codeFromUrl && codeFromUrl.length === 6) {
      const digits = codeFromUrl.split('').slice(0, 6);
      setCode(digits);
      handleVerifyCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const startResendCountdown = () => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6 && newCode.every((d) => d !== '')) {
      handleVerifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      handleVerifyCode(pasted);
    }
  };

  const handleVerifyCode = async (fullCode: string) => {
    if (!email) {
      setError("Adresse email manquante. Veuillez recommencer l'inscription.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Code invalide ou expiré');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Code invalide');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !email) return;
    setIsResending(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/auth/resend-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du renvoi');
      }

      startResendCountdown();
    } catch (err: any) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      handleVerifyCode(fullCode);
    }
  };

  if (success) {
    return (
      <div className={`${archivo.className} flex min-h-screen items-center justify-center bg-[#f3f2f2] px-4`}>
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#f0fdf4]">
            <CheckCircle className="h-10 w-10 text-[#166534]" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">Email vérifié !</h1>
          <p className="text-[#605d5d]">
            Votre adresse email a été confirmée avec succès. Bienvenue sur Actu Plus !
          </p>
          <p className="mt-4 text-sm text-[#9b9797]">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${archivo.className} flex min-h-screen bg-[#f3f2f2] text-[#201e1d]`}>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
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

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#ffe0d9]">
              <Mail className="h-8 w-8 text-[#ec3013]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#201e1d]">Vérifiez votre email</h1>
            <p className="mt-2 text-sm text-[#605d5d]">
              Nous avons envoyé un code à 6 chiffres à
            </p>
            {email && (
              <p className="mt-1 font-semibold text-[#201e1d] break-all">{email}</p>
            )}
          </div>

          {error && (
            <div className="mb-4 border border-[#ffc4b8] bg-[#fff2ef] px-4 py-3 text-sm text-[#ae1800]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-3 block text-center text-sm font-medium text-[#201e1d]">
                Entrez le code de vérification
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className={[
                      'h-12 w-11 border-2 text-center text-xl font-bold',
                      'transition-colors focus:outline-none',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      digit
                        ? 'border-[#ec3013] bg-[#fff2ef] text-[#ae1800]'
                        : 'border-[#d7d3d3] bg-white text-[#201e1d]',
                      'focus:border-[#ec3013] focus:ring-2 focus:ring-[#ec3013]/20',
                      error ? 'border-[#ff9783]' : '',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={code.join('').length < 6 || isLoading}
              className={[
                'w-full px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'bg-[#ec3013] hover:bg-[#dd2b0f] focus:outline-none focus:ring-2 focus:ring-[#ec3013]/50',
              ].join(' ')}
            >
              {isLoading ? 'Vérification...' : 'Vérifier mon email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#605d5d]">Vous n'avez pas reçu le code ?</p>
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending || !email}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ec3013] hover:text-[#ae1800] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
              {resendCountdown > 0
                ? `Renvoyer dans ${resendCountdown}s`
                : isResending
                ? 'Envoi en cours...'
                : 'Renvoyer le code'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm text-[#9b9797] hover:text-[#605d5d]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'inscription
            </Link>
          </div>
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 border-l-2 border-[#201e1d] lg:block">
        <Image
          src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1920&auto=format&fit=crop"
          alt="Actualités"
          fill
          className="object-cover"
          style={{ filter: 'grayscale(1) contrast(1.08)' }}
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-[#201e1d]/75">
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <h2 className="mb-4 text-4xl font-extrabold">Presque prêt !</h2>
            <p className="max-w-md text-center text-lg text-[#bab6b6]">
              Confirmez votre email pour accéder à toutes les actualités.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f3f2f2]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ec3013] border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
