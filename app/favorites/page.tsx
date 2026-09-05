'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicShell } from '../PublicShell';
import { ArticleCard } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { favoritesService } from '@/lib/services';
import { Article, ArticleStatus } from '@/types';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';

type ContentFilter = 'all' | 'summary' | 'article';

// Mapper les données du backend
function mapArticle(data: any): Article {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: data.imageUrl,
    category: data.category || { id: '', name: 'Actualité', slug: 'actualite' },
    country: data.country,
    author: data.author || { id: '', firstName: '', lastName: '', email: '' },
    status: data.isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
    isFeatured: data.isFeatured,
    isPremium: data.isPremium || false,
    views: data.views || 0,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/favorites');
    }
  }, [isAuthenticated, authLoading, router]);

  // Charger les favoris
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const result = await favoritesService.findAll();

      // Le backend retourne des objets Favorite avec une relation article
      const favorites = result.data?.data || result.data || [];
      let fetchedArticles = favorites
        .filter((fav: any) => fav.article) // S'assurer que l'article existe
        .map((fav: any) => mapArticle(fav.article));

      // Filtrer par type de contenu si nécessaire
      if (contentFilter === 'summary') {
        fetchedArticles = fetchedArticles.filter((a) => (a.content?.length ?? 0) < 500);
      } else if (contentFilter === 'article') {
        fetchedArticles = fetchedArticles.filter((a) => (a.content?.length ?? 0) >= 500);
      }

      setArticles(fetchedArticles);
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
      setError('Impossible de charger les favoris');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, contentFilter]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadFavorites();
    }
  }, [isAuthenticated, authLoading, loadFavorites]);

  const handleRemoveFavorite = async (articleId: string) => {
    try {
      await favoritesService.remove(articleId);
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch (err) {
      console.error('Erreur lors de la suppression du favori:', err);
    }
  };

  const filters = [
    { label: 'Tous', value: 'all' },
    { label: 'Résumés', value: 'summary' },
    { label: 'Articles', value: 'article' },
  ];

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading) {
    return (
      <PublicShell>
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#ec3013]" />
        </div>
      </PublicShell>
    );
  }

  // Ne pas afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PublicShell>
      <div className="py-8">
        <div className="mx-auto max-w-360 px-5 sm:px-9">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-[#605d5d] hover:text-[#201e1d]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#ffe0d9]">
                <Heart className="h-6 w-6 text-[#ae1800]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">Mes favoris</h1>
                <p className="text-sm text-[#605d5d]">
                  {articles.length} article{articles.length !== 1 ? 's' : ''} sauvegardé{articles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex gap-0 border border-[#201e1d]">
            {filters.map((filter, i) => (
              <button
                key={filter.value}
                onClick={() => setContentFilter(filter.value as ContentFilter)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${i > 0 ? 'border-l border-[#201e1d]' : ''} ${
                  contentFilter === filter.value
                    ? 'bg-[#201e1d] text-white'
                    : 'text-[#201e1d] hover:bg-[#eae9e9]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#ec3013]" />
            </div>
          ) : error ? (
            <div className="border border-[#ffc4b8] bg-[#fff2ef] p-8 text-center">
              <p className="text-[#ae1800]">{error}</p>
              <Button
                variant="modernist-outline"
                size="sm"
                className="mt-4"
                onClick={loadFavorites}
              >
                Réessayer
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="border border-[#d7d3d3] bg-[#f8f4f4] p-12 text-center">
              <Heart className="mx-auto h-12 w-12 text-[#d7d3d3]" />
              <h3 className="mt-4 text-lg font-bold text-[#201e1d]">
                Aucun favori
              </h3>
              <p className="mt-2 text-sm text-[#605d5d]">
                Vous n'avez pas encore ajouté d'articles à vos favoris.
              </p>
              <Link href="/articles">
                <Button variant="modernist" className="mt-6">
                  Découvrir les articles
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <div key={article.id} className="relative">
                  <ArticleCard article={article} variant="compact" />
                  <button
                    onClick={() => handleRemoveFavorite(article.id)}
                    className="absolute right-3 top-3 border border-[#d7d3d3] bg-white p-2 transition-colors hover:border-[#ec3013] hover:bg-[#fff2ef]"
                    title="Retirer des favoris"
                  >
                    <Heart className="h-4 w-4 fill-[#ec3013] text-[#ec3013]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
