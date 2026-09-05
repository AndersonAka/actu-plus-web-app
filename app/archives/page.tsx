'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PublicShell } from '../PublicShell';
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
      <PublicShell>
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#ec3013]" />
        </div>
      </PublicShell>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <PublicShell>
      <div className="py-8">
        <div className="mx-auto max-w-360 px-5 sm:px-9">
          <div className="mb-8">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-[#605d5d] hover:text-[#201e1d]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-[#ffe0d9]">
                <Archive className="h-6 w-6 text-[#ae1800]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">Archives</h1>
                <p className="text-sm text-[#605d5d]">
                  {totalCount > 0
                    ? `${totalCount} article${totalCount !== 1 ? 's' : ''} archivé${totalCount !== 1 ? 's' : ''}`
                    : 'Articles archivés'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-0 border border-[#201e1d]">
            {filters.map((filter, i) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleFilterChange(filter.value)}
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
                onClick={() => loadArchives(currentPage, contentFilter)}
              >
                Réessayer
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="border border-[#d7d3d3] bg-[#f8f4f4] p-12 text-center">
              <Archive className="mx-auto h-12 w-12 text-[#d7d3d3]" />
              <h3 className="mt-4 text-lg font-bold text-[#201e1d]">
                Aucune archive
              </h3>
              <p className="mt-2 text-sm text-[#605d5d]">
                Aucun article archivé pour ce filtre.
              </p>
              <Link href="/articles">
                <Button variant="modernist" className="mt-6">
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
      </div>
    </PublicShell>
  );
}
