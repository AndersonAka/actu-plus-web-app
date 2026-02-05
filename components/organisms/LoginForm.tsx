'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Alert, Divider } from '@/components/atoms';
import { SocialLoginButtons } from '@/components/molecules';
import { Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if user is blocked
  useEffect(() => {
    const storedBlockEndTime = localStorage.getItem('loginBlockEndTime');
    if (storedBlockEndTime) {
      const endTime = parseInt(storedBlockEndTime);
      if (Date.now() < endTime) {
        setIsBlocked(true);
        setBlockEndTime(endTime);
      } else {
        localStorage.removeItem('loginBlockEndTime');
        localStorage.removeItem('loginAttemptCount');
      }
    }

    const storedAttemptCount = localStorage.getItem('loginAttemptCount');
    if (storedAttemptCount) {
      setAttemptCount(parseInt(storedAttemptCount));
    }
  }, []);

  // Update block status
  useEffect(() => {
    if (isBlocked && blockEndTime) {
      const timer = setInterval(() => {
        if (Date.now() >= blockEndTime) {
          setIsBlocked(false);
          setBlockEndTime(null);
          setAttemptCount(0);
          localStorage.removeItem('loginBlockEndTime');
          localStorage.removeItem('loginAttemptCount');
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isBlocked, blockEndTime]);

  const onSubmit = async (data: LoginFormData) => {
    // Check if blocked
    if (isBlocked) {
      const remainingTime = blockEndTime ? Math.ceil((blockEndTime - Date.now()) / 1000 / 60) : 0;
      setError(`Trop de tentatives échouées. Veuillez réessayer dans ${remainingTime} minute(s).`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Increment attempt count on failure
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        localStorage.setItem('loginAttemptCount', newAttemptCount.toString());

        // Block after 5 failed attempts
        if (newAttemptCount >= 5) {
          const blockTime = Date.now() + 15 * 60 * 1000; // 15 minutes
          setIsBlocked(true);
          setBlockEndTime(blockTime);
          localStorage.setItem('loginBlockEndTime', blockTime.toString());
          throw new Error('Trop de tentatives échouées. Votre compte est temporairement bloqué pour 15 minutes.');
        }

        const remainingAttempts = 5 - newAttemptCount;
        throw new Error(`${result.message || 'Erreur de connexion'}. ${remainingAttempts} tentative(s) restante(s).`);
      }

      // Reset attempt count on success
      setAttemptCount(0);
      localStorage.removeItem('loginAttemptCount');
      localStorage.removeItem('loginBlockEndTime');

      // Force a hard navigation to ensure proper state refresh
      window.location.href = returnUrl;
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="mt-2 text-gray-600">
          Connectez-vous à votre compte Actu Plus
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.identifier?.message}
          {...register('identifier')}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Se souvenir de moi</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Se connecter
        </Button>
      </form>

      <Divider label="ou" className="my-6" />

      <SocialLoginButtons mode="login" />

      <p className="mt-6 text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
};

export { LoginForm };
