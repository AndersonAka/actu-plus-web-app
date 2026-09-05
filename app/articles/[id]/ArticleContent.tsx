'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Article } from '@/types';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { sanitizeArticleContent } from '@/lib/articles/sanitize-content';
import { Button } from '@/components/atoms';
import { SummaryItemsList } from '@/components/molecules';
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
        <div className="h-4 bg-[#eae9e9] mb-4"></div>
        <div className="h-4 bg-[#eae9e9] mb-4 w-3/4"></div>
        <div className="h-4 bg-[#eae9e9] mb-4"></div>
        <div className="h-4 bg-[#eae9e9] w-1/2"></div>
      </div>
    );
  }

  const hasSummaryItems = article.summaryItems && article.summaryItems.length > 0;

  // Accès autorisé : afficher le contenu complet
  if (hasAccess) {
    return (
      <article className="prose prose-lg max-w-none">
        {hasSummaryItems ? (
          <SummaryItemsList items={article.summaryItems!} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(article.content) }} />
        )}
      </article>
    );
  }

  // Accès refusé : afficher un aperçu et un message
  return (
    <div>
      {/* Aperçu du contenu */}
      <article className="prose prose-lg max-w-none relative">
        {hasSummaryItems ? (
          <SummaryItemsList items={article.summaryItems!} limit={1} />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(article.content).substring(0, 500) + '...' }}
            className="relative"
          />
        )}
        {/* Gradient de fondu */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f3f2f2] to-transparent" />
      </article>

      {/* Message d'accès premium */}
      <div className="mt-8 border border-[#ffc4b8] bg-[#fff2ef] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-[#ec3013]">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-extrabold text-[#201e1d]">
          Contenu Abonné
        </h3>
        <p className="mb-6 text-[#605d5d]">
          {!isAuthenticated
            ? 'Connectez-vous et abonnez-vous pour accéder à ce contenu réservé aux abonnés.'
            : 'Abonnez-vous pour accéder à cet article et à tout le contenu réservé aux abonnés.'}
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {!isAuthenticated ? (
            <>
              <Link href={`/login?returnUrl=${encodeURIComponent(getArticlePublicPath(article))}`}>
                <Button variant="modernist" leftIcon={<Lock className="h-4 w-4" />}>
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="modernist-outline">
                  Créer un compte
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/subscriptions">
              <Button variant="modernist" leftIcon={<Crown className="h-4 w-4" />}>
                Voir les abonnements
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
