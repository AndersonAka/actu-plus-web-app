'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Article } from '@/types';
import { Button } from '@/components/atoms';
import { Lock, Crown } from 'lucide-react';

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const { user, isAuthenticated, isLoading, isVeilleur, isModerateur, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Article public : accès pour tous
      if (!article.isPremium) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
      }

      // Article premium : vérifier l'accès
      if (!isAuthenticated) {
        setHasAccess(false);
        setCheckingAccess(false);
        return;
      }

      // Admin, Manager ou Veilleur ont toujours accès
      if (isAdmin() || isModerateur() || isVeilleur()) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
      }

      // Utilisateur standard : vérifier l'abonnement
      try {
        const response = await fetch('/api/proxy/subscriptions/active', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setHasAccess(data.hasActiveSubscription || false);
        } else {
          setHasAccess(false);
        }
      } catch {
        setHasAccess(false);
      }
      setCheckingAccess(false);
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [article.isPremium, isAuthenticated, isLoading, isAdmin, isModerateur, isVeilleur]);

  // Afficher un loader pendant la vérification
  if (isLoading || checkingAccess) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  // Accès autorisé : afficher le contenu complet
  if (hasAccess) {
    return (
      <article className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    );
  }

  // Accès refusé : afficher un aperçu et un message
  const previewContent = article.content.substring(0, 500) + '...';

  return (
    <div>
      {/* Aperçu du contenu */}
      <article className="prose prose-lg max-w-none relative">
        <div 
          dangerouslySetInnerHTML={{ __html: previewContent }} 
          className="relative"
        />
        {/* Gradient de fondu */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </article>

      {/* Message d'accès premium */}
      <div className="mt-8 rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-primary-100 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          Contenu Abonné
        </h3>
        <p className="mb-6 text-gray-600">
          {!isAuthenticated
            ? 'Connectez-vous et abonnez-vous pour accéder à ce contenu réservé aux abonnés.'
            : 'Abonnez-vous pour accéder à cet article et à tout le contenu réservé aux abonnés.'}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {!isAuthenticated ? (
            <>
              <Link href={`/login?returnUrl=/articles/${article.id}`}>
                <Button variant="primary" leftIcon={<Lock className="h-4 w-4" />}>
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">
                  Créer un compte
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/subscriptions">
              <Button variant="primary" leftIcon={<Crown className="h-4 w-4" />}>
                Voir les abonnements
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
