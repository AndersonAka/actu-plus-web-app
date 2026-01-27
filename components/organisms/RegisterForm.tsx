'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Alert, Divider } from '@/components/atoms';
import { SocialLoginButtons } from '@/components/molecules';
import { Mail, Lock, User, Phone } from 'lucide-react';

const registerSchema = z.object({
  civility: z.enum(['M.', 'Mme'], { message: 'La civilité est requise' }),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide (format: +225XXXXXXXXX)').optional().or(z.literal('')),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...registerData } = data;
      
      const response = await fetch('/api/proxy/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de l'inscription");
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="mt-2 text-gray-600">
          Rejoignez Actu Plus pour accéder à toutes les actualités
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Civilité</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="M."
                {...register('civility')}
                className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Monsieur</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="Mme"
                {...register('civility')}
                className="h-4 w-4 border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Madame</span>
            </label>
          </div>
          {errors.civility && (
            <p className="mt-1 text-sm text-red-500">{errors.civility.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prénom"
            placeholder="Jean"
            leftIcon={<User className="h-5 w-5" />}
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Nom"
            placeholder="Dupont"
            leftIcon={<User className="h-5 w-5" />}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+2250000000000"
          leftIcon={<Phone className="h-5 w-5" />}
          error={errors.phone?.message}
          {...register('phone')}
          hint="Format international sans espaces (ex: +2250700000000)"
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            J'accepte les{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              conditions d'utilisation
            </Link>{' '}
            et la{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              politique de confidentialité
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Créer mon compte
        </Button>
      </form>

      <Divider label="ou" className="my-6" />

      <SocialLoginButtons mode="register" />

      <p className="mt-6 text-center text-sm text-gray-600">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-primary-600 hover:text-primary-700"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
};

export { RegisterForm };
