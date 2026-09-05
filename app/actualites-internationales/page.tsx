'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { PublicShell } from '../PublicShell';
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
                <Globe2 className="h-6 w-6 text-[#ae1800]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">Actualités Internationales</h1>
                <p className="text-sm text-[#605d5d]">
                  {totalCount > 0
                    ? `${totalCount} article${totalCount !== 1 ? 's' : ''}`
                    : 'Actualités hors zone nationale'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap border border-[#201e1d]">
            {zoneFilters.map((filter, i) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setZoneFilter(filter.value)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${i > 0 ? 'border-l border-[#201e1d]' : ''} ${
                  zoneFilter === filter.value
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
              <Button variant="modernist-outline" size="sm" className="mt-4" onClick={() => loadArticles(currentPage, zoneFilter)}>
                Réessayer
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="border border-[#d7d3d3] bg-[#f8f4f4] p-12 text-center">
              <Globe2 className="mx-auto h-12 w-12 text-[#d7d3d3]" />
              <h3 className="mt-4 text-lg font-bold text-[#201e1d]">Aucune actualité internationale</h3>
              <p className="mt-2 text-sm text-[#605d5d]">Revenez bientôt pour découvrir nos actualités internationales.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={getArticlePublicPath(article)}
                    className="group flex flex-col overflow-hidden border border-[#d7d3d3] bg-white transition-colors hover:border-[#201e1d]/40"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      {(article.coverImage || article.imageUrl) ? (
                        <img
                          src={article.coverImage || article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#eae9e9]">
                          <Globe2 className="h-8 w-8 text-[#d7d3d3]" />
                        </div>
                      )}
                      {article.internationalCountryName && (
                        <div className="absolute bottom-2 left-2 bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#201e1d]">
                          {article.internationalCountryFlag && <span className="mr-1">{article.internationalCountryFlag}</span>}
                          {article.internationalCountryName}
                        </div>
                      )}
                      {article.zone && (
                        <div className="absolute top-2 right-2 bg-[#ec3013] px-2.5 py-1 text-[10px] font-semibold text-white">
                          {article.zone === 'uemoa' ? 'UEMOA' : 'Hors UEMOA'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      {article.category?.name && (
                        <span className="mb-1.5 self-start bg-[#eae9e9] px-2 py-0.5 text-xs font-semibold text-[#201e1d]">
                          {article.category.name}
                        </span>
                      )}
                      <h3 className="mb-1.5 line-clamp-2 text-sm font-bold leading-snug text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="line-clamp-2 text-sm text-[#605d5d] leading-relaxed">{article.excerpt}</p>
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
      </div>
    </PublicShell>
  );
}
