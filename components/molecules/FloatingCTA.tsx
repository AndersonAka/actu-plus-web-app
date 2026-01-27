'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';

export interface FloatingCTAProps {
  className?: string;
}

const FloatingCTA = ({ className }: FloatingCTAProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher après un délai ou après scroll
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };

    // Afficher après 3 secondes ou au scroll
    const timer = setTimeout(() => setIsVisible(true), 3000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Ne pas afficher si l'utilisateur est connecté ou si le chargement est en cours
  if (isLoading || isAuthenticated || !isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom-4 duration-500',
        'sm:bottom-6 sm:left-auto sm:right-6',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/5">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50" />

        {/* Content */}
        <div className="relative">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary-600">
            Nouveau sur Actu Plus ?
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900">
            Restez informé
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            Créez un compte gratuit pour accéder aux favoris, notifications et bien plus.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/register" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">
                Créer un compte
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FloatingCTA };
