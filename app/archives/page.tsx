'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer } from '@/components/organisms';
import { ArticleCard } from '@/components/molecules';
import { Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  filterSystemArchivesClient,
  getSystemArchivesPageSize,
  getSystemArchivesQueryParams,
  parseArticlesPaginatedResponse,
  type SystemArchiveFilter,
} from '@/lib/utils/system-archives';
import { Article, ArticleStatus } from '@/types';
import { Archive, ArrowLeft, Loader2 } from 'lucide-react';

const PAGE_SIZE = getSystemArchivesPageSize();

function mapArticle(data: Record<string, unknown>): Article {
  const category = (data.category as Article['category']) || {
    id: '',
    name: 'Actualité',
    slug: 'actualite',
  };
  const country = (data.country as Article['country']) || {
    id: '',
    name: '',
    code: '',
    flag: '',
  };
  const author = (data.author as Article['author']) || {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
  };

  return {
    id: String(data.id),
    title: String(data.title ?? ''),
    slug: String(data.slug ?? ''),
    content: String(data.content ?? ''),
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    coverImage: data.imageUrl ? String(data.imageUrl) : undefined,
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    category,
    country,
    author,
    status: data.isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
    contentType: data.contentType as Article['contentType'],
    articleSection: data.articleSection as Article['articleSection'],
    isFeatured: Boolean(data.isFeatured),
    isPremium: Boolean(data.isPremium),
    isPublished: Boolean(data.isPublished),
    views: Number(data.views) || 0,
    publishedAt: data.publishedAt ? String(data.publishedAt) : undefined,
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
  };
}

export default function ArchivesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentFilter, setContentFilter] = useState<SystemArchiveFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/archives');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadArchives = useCallback(
    async (page: number, filter: SystemArchiveFilter) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const query = getSystemArchivesQueryParams(filter, page, PAGE_SIZE);
        const response = await fetch(`/api/proxy/articles?${query}`);

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des archives');
        }

        const result = await response.json();
        const { articles: raw, total, totalPages: pages } =
          parseArticlesPaginatedResponse(result);

        let mapped = raw.map((item) =>
          mapArticle(item as Record<string, unknown>),
        );

        if (filter === 'article') {
          mapped = filterSystemArchivesClient(mapped, 'article');
        }

        setArticles(mapped);
        setTotalCount(total);
        setTotalPages(Math.max(1, pages));
        setCurrentPage(page);
      } catch (err) {
        console.error('Erreur lors du chargement des archives:', err);
        setError('Impossible de charger les archives');
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadArchives(1, contentFilter);
    }
  }, [isAuthenticated, authLoading, contentFilter, loadArchives]);

  const handlePageChange = (page: number) => {
    loadArchives(page, contentFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (value: SystemArchiveFilter) => {
    setContentFilter(value);
    setCurrentPage(1);
  };

  const filters: { label: string; value: SystemArchiveFilter }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Chroniques', value: 'chronique' },
    { label: 'Focus', value: 'focus' },
    { label: 'Articles', value: 'article' },
  ];

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Archive className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Archives</h1>
                <p className="text-sm text-gray-500">
                  {totalCount > 0
                    ? `${totalCount} article${totalCount !== 1 ? 's' : ''} archivé${totalCount !== 1 ? 's' : ''} automatiquement (après 24 h)`
                    : 'Articles archivés automatiquement après 24 h de publication'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleFilterChange(filter.value)}
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
                onClick={() => loadArchives(currentPage, contentFilter)}
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
                Aucun article archivé pour ce filtre.
              </p>
              <Link href="/articles">
                <Button variant="primary" className="mt-6">
                  Découvrir les articles
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
