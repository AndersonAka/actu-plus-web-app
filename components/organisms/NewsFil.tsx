import Link from 'next/link';
import { format } from 'date-fns';
import { getArticlePublicPath } from '@/lib/articles/article-url';

export interface NewsFilArticle {
  id: string;
  title: string;
  slug?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  country?: { name?: string | null } | null;
  category?: { name?: string | null } | null;
}

interface NewsFilProps {
  articles: NewsFilArticle[];
  compact?: boolean;
}

function filMeta(article: NewsFilArticle) {
  const publishedDate = article.publishedAt || article.createdAt;
  const time = publishedDate ? format(new Date(publishedDate), "HH'h'mm") : null;
  const tags = [article.country?.name, article.category?.name].filter(Boolean).join(' · ');
  return { time, tags };
}

export function NewsFil({ articles }: NewsFilProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden border border-[#ec3013]/70 bg-[#1a1614] px-5 py-7 text-white sm:px-7">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#ec3013] to-transparent" />
      <div className="mb-4 flex shrink-0 items-baseline justify-between pb-3">
        <span className="text-sm font-semibold tracking-[0.22em] text-white/90">LE FIL</span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#ec3013]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec3013] opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ec3013]" />
          </span>
          Temps réel
        </span>
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-white/50">Aucun article publié pour le moment.</p>
      ) : (
        <div className="home-fil-viewport min-h-0 flex-1">
          <div
            className="home-fil-track"
            style={{ animationDuration: `${Math.max(articles.length, 1) * 4.5}s` }}
          >
            {[0, 1].map((copy) =>
              articles.map((article) => {
                const { time, tags } = filMeta(article);
                return (
                  <Link
                    key={`${copy}-${article.id}`}
                    href={getArticlePublicPath(article)}
                    className={`group relative block shrink-0 overflow-hidden bg-white/[0.04] px-4 py-3.5 transition-all duration-300 hover:bg-white/[0.08] before:absolute before:inset-y-3 before:left-0 before:w-px before:bg-[#ff5a3c]/50 before:transition-all before:duration-300 hover:before:w-0.5 hover:before:bg-[#ff5a3c] hover:before:shadow-[0_0_14px_#ff5a3c] ${copy === 1 ? 'home-fil-duplicate' : ''}`}
                    aria-hidden={copy === 1 ? true : undefined}
                    tabIndex={copy === 1 ? -1 : undefined}
                  >
                    {time && (
                      <div className="mb-1 font-medium tracking-[0.16em] text-[10px] text-[#ff7a62]">{time}</div>
                    )}
                    <div className="mb-1.5 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em] text-white/90 transition-colors duration-300 group-hover:text-white">
                      {article.title}
                    </div>
                    {tags && (
                      <div className="text-[11px] font-medium tracking-[0.04em] text-white/40">
                        {tags}
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export async function fetchNewsFilArticles(limit = 10): Promise<NewsFilArticle[]> {
  const response = await fetch(`/api/proxy/articles?limit=${limit}&sortBy=date&sortOrder=DESC`);
  if (!response.ok) return [];
  const result = await response.json();
  const root = result as Record<string, unknown>;
  const payload =
    root?.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const raw = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(root?.data)
      ? root.data
      : [];

  return raw.slice(0, limit).map((item) => {
    const data = item as Record<string, unknown>;
    return {
      id: String(data.id),
      title: String(data.title ?? ''),
      slug: data.slug ? String(data.slug) : null,
      publishedAt: data.publishedAt ? String(data.publishedAt) : null,
      createdAt: String(data.createdAt ?? ''),
      country: data.country as NewsFilArticle['country'],
      category: data.category as NewsFilArticle['category'],
    };
  });
}

export function NewsFilHorizontal({ articles, compact = false }: NewsFilProps) {
  return (
    <div className={`relative flex min-w-0 items-center gap-4 overflow-hidden border border-[#ec3013]/70 bg-[#1a1614] text-white ${compact ? 'h-11 px-3' : 'h-[4.75rem] px-4'}`}>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#ec3013] to-transparent" />
      <span className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-white/90">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec3013] opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ec3013]" />
        </span>
        LE FIL
      </span>
      {articles.length === 0 ? (
        <p className="truncate text-sm text-white/50">Aucun article publié pour le moment.</p>
      ) : (
        <div className="home-fil-viewport-x">
          <div
            className="home-fil-track-x"
            style={{ animationDuration: `${Math.max(articles.length, 1) * 12}s` }}
          >
            {[0, 1].map((copy) =>
              articles.map((article) => {
                const { time, tags } = filMeta(article);
                return (
                  <Link
                    key={`${copy}-${article.id}`}
                    href={getArticlePublicPath(article)}
                    className={`group flex h-full shrink-0 items-center gap-3 border-r border-white/10 px-5 transition-colors hover:bg-white/[0.06] ${copy === 1 ? 'home-fil-duplicate' : ''}`}
                    aria-hidden={copy === 1 ? true : undefined}
                    tabIndex={copy === 1 ? -1 : undefined}
                  >
                    {time && (
                      <span className="font-medium tracking-[0.14em] text-[10px] text-[#ff7a62]">{time}</span>
                    )}
                    <span className="max-w-[280px] truncate text-sm font-medium text-white/90 group-hover:text-white">
                      {article.title}
                    </span>
                    {tags && !compact && (
                      <span className="max-w-[140px] truncate text-[11px] text-white/40">{tags}</span>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
