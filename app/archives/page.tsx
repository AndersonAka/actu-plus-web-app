'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/organisms';
import { ArticleCard } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { Article, ArticleStatus } from '@/types';
import { Archive, ArrowLeft, Loader2 } from 'lucide-react';

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

export default function ArchivesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/archives');
    }
  }, [isAuthenticated, authLoading, router]);

  // Charger les archives
  const loadArchives = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      // Charger les articles archivés via l'API articles avec status=archived
      const response = await fetch('/api/proxy/articles?status=archived&limit=50');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des archives');
      }
      
      const result = await response.json();
      let fetchedArticles = (result.data?.data || result.data || []).map(mapArticle);
      
      // Filtrer par type de contenu si nécessaire
      if (contentFilter === 'summary') {
        fetchedArticles = fetchedArticles.filter((a: Article) => a.content?.length < 500);
      } else if (contentFilter === 'article') {
        fetchedArticles = fetchedArticles.filter((a: Article) => a.content?.length >= 500);
      }
      
      setArticles(fetchedArticles);
    } catch (err) {
      console.error('Erreur lors du chargement des archives:', err);
      setError('Impossible de charger les archives');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, contentFilter]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadArchives();
    }
  }, [isAuthenticated, authLoading, loadArchives]);

  const handleRemoveArchive = async (articleId: string) => {
    try {
      // Désarchiver l'article en changeant son statut
      const response = await fetch(`/api/proxy/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      
      if (response.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      }
    } catch (err) {
      console.error('Erreur lors du désarchivage:', err);
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
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </main>
        <Footer />
      </div>
    );
  }

  // Ne pas afficher si non authentifié (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Archive className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mes archives</h1>
                <p className="text-sm text-gray-500">
                  {articles.length} article{articles.length !== 1 ? 's' : ''} archivé{articles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setContentFilter(filter.value as ContentFilter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  contentFilter === filter.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={loadArchives}
              >
                Réessayer
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center">
              <Archive className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucune archive
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Vous n'avez pas encore archivé d'articles.
              </p>
              <Link href="/articles">
                <Button variant="primary" className="mt-6">
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
                    onClick={() => handleRemoveArchive(article.id)}
                    className="absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-blue-50"
                    title="Désarchiver"
                  >
                    <Archive className="h-4 w-4 text-blue-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
