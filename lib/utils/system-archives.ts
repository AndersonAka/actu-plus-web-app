/**
 * Filtres archives système (aligné mobile / API articles)
 */

import { Article, ArticleSection } from '@/types';

export type SystemArchiveFilter = 'all' | 'chronique' | 'focus' | 'article';

const PAGE_SIZE_DEFAULT = 15;

export function getSystemArchivesPageSize(): number {
  return PAGE_SIZE_DEFAULT;
}

/** Paramètres query pour GET /api/proxy/articles */
export function getSystemArchivesQueryParams(
  filter: SystemArchiveFilter,
  page: number,
  limit = PAGE_SIZE_DEFAULT,
): string {
  const params = new URLSearchParams({
    isArchive: 'true',
    archivedBySystem: 'true',
    page: String(page),
    limit: String(limit),
    sortBy: 'date',
    sortOrder: 'DESC',
  });

  if (filter === 'chronique') {
    params.set('articleSection', ArticleSection.CHRONIQUE);
  } else if (filter === 'focus') {
    params.set('articleSection', ArticleSection.FOCUS);
  } else if (filter === 'article') {
    params.set('contentType', 'article');
  }

  return params.toString();
}

/** Filtre client pour « Articles » (exclut focus, chronique, résumés) */
export function filterSystemArchivesClient(
  articles: Article[],
  filter: SystemArchiveFilter,
): Article[] {
  if (filter === 'all' || filter === 'chronique' || filter === 'focus') {
    return articles;
  }

  return articles.filter(
    (a) =>
      a.articleSection !== ArticleSection.FOCUS &&
      a.articleSection !== ArticleSection.CHRONIQUE &&
      a.contentType !== 'summary',
  );
}

export function parseArticlesPaginatedResponse(result: unknown): {
  articles: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const root = result as Record<string, unknown>;
  const payload =
    root?.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const articles = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
      ? payload
      : Array.isArray(root?.data)
        ? root.data
        : [];

  const total =
    typeof payload?.total === 'number'
      ? payload.total
      : typeof root?.total === 'number'
        ? root.total
        : articles.length;

  const page =
    typeof payload?.page === 'number'
      ? payload.page
      : typeof root?.page === 'number'
        ? root.page
        : 1;

  const limit =
    typeof payload?.limit === 'number'
      ? payload.limit
      : typeof root?.limit === 'number'
        ? root.limit
        : PAGE_SIZE_DEFAULT;

  const totalPages =
    typeof payload?.totalPages === 'number'
      ? payload.totalPages
      : typeof root?.totalPages === 'number'
        ? root.totalPages
        : Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return { articles, total, page, limit, totalPages };
}
