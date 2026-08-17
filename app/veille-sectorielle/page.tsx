'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/organisms';
import { ArticleCard, Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { parseArticlesPaginatedResponse } from '@/lib/utils/system-archives';
import { Article, ArticleStatus, Category, Zone } from '@/types';
import { Radar, ArrowLeft, Loader2 } from 'lucide-react';

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

export default function VeilleSectoriellePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [zoneFilter, setZoneFilter] = useState<Zone | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/proxy/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        const cats = json.data || json;
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
  }, []);

  const loadArticles = useCallback(
    async (page: number, zone: Zone | 'all', categoryId: string) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          articleSection: 'veille-sectorielle',
          page: String(page),
          limit: String(PAGE_SIZE),
          sortBy: 'date',
          sortOrder: 'DESC',
        });
        if (zone !== 'all') params.set('zone', zone);
        if (categoryId !== 'all') params.set('categoryId', categoryId);

        const response = await fetch(`/api/proxy/articles?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la Veille Sectorielle');
        }

        const result = await response.json();
        const { articles: raw, total, totalPages: pages } = parseArticlesPaginatedResponse(result);

        setArticles(raw.map((item) => mapArticle(item as Record<string, unknown>)));
        setTotalCount(total);
        setTotalPages(Math.max(1, pages));
        setCurrentPage(page);
      } catch (err) {
        console.error('Erreur lors du chargement de la Veille Sectorielle:', err);
        setError('Impossible de charger la Veille Sectorielle');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadArticles(1, zoneFilter, categoryFilter);
  }, [zoneFilter, categoryFilter, loadArticles]);

  const handlePageChange = (page: number) => {
    loadArticles(page, zoneFilter, categoryFilter);
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                <Radar className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Veille Sectorielle</h1>
                <p className="text-sm text-gray-500">
                  {totalCount > 0
                    ? `${totalCount} article${totalCount !== 1 ? 's' : ''}`
                    : 'Politique, Économie, Social — Zone UEMOA et Hors UEMOA'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {zoneFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setZoneFilter(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  zoneFilter === filter.value
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes catégories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => loadArticles(currentPage, zoneFilter, categoryFilter)}
              >
                Réessayer
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center">
              <Radar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun article</h3>
              <p className="mt-2 text-sm text-gray-500">Aucun article de Veille Sectorielle pour ce filtre.</p>
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
