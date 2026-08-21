'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/organisms';
import { Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { parseArticlesPaginatedResponse } from '@/lib/utils/system-archives';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { Article, ArticleStatus, Zone } from '@/types';
import { Globe2, ArrowLeft, Loader2 } from 'lucide-react';

const PAGE_SIZE = 12;

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
    zone: data.zone as Article['zone'],
    internationalCountryName: data.internationalCountryName as string | undefined,
    internationalCountryFlag: data.internationalCountryFlag as string | undefined,
    isFeatured: Boolean(data.isFeatured),
    isPremium: Boolean(data.isPremium),
    isPublished: Boolean(data.isPublished),
    views: Number(data.views) || 0,
    publishedAt: data.publishedAt ? String(data.publishedAt) : undefined,
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
  };
}

const zoneFilters: { label: string; value: Zone | 'all' }[] = [
  { label: 'Toutes zones', value: 'all' },
  { label: 'Zone UEMOA', value: 'uemoa' },
  { label: 'Hors UEMOA', value: 'hors-uemoa' },
];

export default function ActualitesInternationalesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [zoneFilter, setZoneFilter] = useState<Zone | 'all'>('all');

  const loadArticles = useCallback(async (page: number, zone: Zone | 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        scope: 'international',
        page: String(page),
        limit: String(PAGE_SIZE),
        sortBy: 'date',
        sortOrder: 'DESC',
      });
      if (zone !== 'all') params.set('zone', zone);

      const response = await fetch(`/api/proxy/articles?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des actualités internationales');
      }

      const result = await response.json();
      const { articles: raw, total, totalPages: pages } = parseArticlesPaginatedResponse(result);

      setArticles(raw.map((item) => mapArticle(item as Record<string, unknown>)));
      setTotalCount(total);
      setTotalPages(Math.max(1, pages));
      setCurrentPage(page);
    } catch (err) {
      console.error('Erreur lors du chargement des actualités internationales:', err);
      setError('Impossible de charger les actualités internationales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles(1, zoneFilter);
  }, [zoneFilter, loadArticles]);

  const handlePageChange = (page: number) => {
    loadArticles(page, zoneFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <Globe2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Actualités Internationales</h1>
                <p className="text-sm text-gray-500">
                  {totalCount > 0
                    ? `${totalCount} article${totalCount !== 1 ? 's' : ''}`
                    : 'Actualités hors zone nationale'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {zoneFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setZoneFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  zoneFilter === filter.value
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => loadArticles(currentPage, zoneFilter)}>
                Réessayer
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center">
              <Globe2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune actualité internationale</h3>
              <p className="mt-2 text-sm text-gray-500">Revenez bientôt pour découvrir nos actualités internationales.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={getArticlePublicPath(article)}
                    className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      {(article.coverImage || article.imageUrl) ? (
                        <img
                          src={article.coverImage || article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-indigo-100">
                          <Globe2 className="h-8 w-8 text-indigo-200" />
                        </div>
                      )}
                      {article.internationalCountryName && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
                          {article.internationalCountryFlag && <span className="mr-1">{article.internationalCountryFlag}</span>}
                          {article.internationalCountryName}
                        </div>
                      )}
                      {article.zone && (
                        <div className="absolute top-2 right-2 rounded-full bg-indigo-600/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
                          {article.zone === 'uemoa' ? 'UEMOA' : 'Hors UEMOA'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {article.category?.name && (
                        <span className="mb-1.5 self-start rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {article.category.name}
                        </span>
                      )}
                      <h3 className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-primary-600 transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="line-clamp-2 text-sm text-gray-500 leading-relaxed">{article.excerpt}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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
