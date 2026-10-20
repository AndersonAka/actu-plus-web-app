import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/atoms';
import { ArticleCard } from '@/components/molecules';
import { PublicShell } from '../../PublicShell';
import { apiConfig } from '@/config/api.config';
import { Article, ArticleStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Eye, Crown, ExternalLink } from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { BackButton } from './BackButton';
import { ShareButton } from './ShareButton';
import { FavoriteButton } from './FavoriteButton';
import { ArticleEngagement } from './ArticleEngagement';
import { NewsFil, NewsFilArticle } from '@/components/organisms/NewsFil';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { fetchArticleByIdOrSlug } from '@/lib/articles/fetch-article';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mapper les données du backend vers le type Article du frontend
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
    sources: data.sources || [],
  };
}

async function getArticle(idOrSlug: string): Promise<Article | null> {
  try {
    const articleData = await fetchArticleByIdOrSlug(apiConfig.baseUrl, idOrSlug);
    if (!articleData) return null;
    return mapArticle(articleData);
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

async function getLatestArticles(excludeId: string): Promise<NewsFilArticle[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles?limit=12&sortBy=date&sortOrder=DESC`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const result = await response.json();
    const articles = result.data?.data || result.data || [];
    const list = Array.isArray(articles) ? articles : [];
    return list
      .filter((item: { id?: string }) => item.id && item.id !== excludeId)
      .slice(0, 10)
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        publishedAt: item.publishedAt,
        createdAt: item.createdAt,
        country: item.country,
        category: item.category,
      }));
  } catch {
    return [];
  }
}

async function getRelatedArticles(categoryId: string | undefined, excludeId: string): Promise<Article[]> {
  if (!categoryId) return [];
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles?categoryId=${categoryId}&limit=4`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const result = await response.json();
    const articles = result.data?.data || [];
    return articles.filter((a: any) => a.id !== excludeId).slice(0, 3).map(mapArticle);
  } catch {
    return [];
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const [relatedArticles, latestArticles] = await Promise.all([
    getRelatedArticles(article.category?.id, article.id),
    getLatestArticles(article.id),
  ]);

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd MMMM yyyy', { locale: fr })
    : format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: fr });

  return (
    <PublicShell>
      <div className="py-8">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <BackButton
              countryCode={article.country?.code}
              countryName={article.country?.name}
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-[#605d5d]">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-[#605d5d]">
                <Eye className="h-4 w-4" />
                {article.views} vues
              </span>
              <FavoriteButton articleId={article.id} />
              <ShareButton
                title={article.title}
                excerpt={article.excerpt}
                articlePath={getArticlePublicPath(article)}
              />
            </div>
          </div>

          <header className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Badge className="rounded-none bg-[#ec3013] text-white">{article.category?.name || 'Actualité'}</Badge>
              {article.country && (
                <Badge className="rounded-none bg-[#eae9e9] text-[#201e1d]">{article.country.name}</Badge>
              )}
              {article.isPremium && (
                <Badge className="rounded-none bg-[#ffe0d9] text-[#ae1800] flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Contenu abonné
                </Badge>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-extrabold text-[#201e1d] sm:text-4xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-lg text-[#605d5d]">{article.excerpt}</p>
            )}
          </header>

          {article.coverImage && (
            <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized={true}
                priority
              />
            </div>
          )}

          <ArticleContent article={article} />

          {/* Sources Section */}
          {article.sources && article.sources.length > 0 && (
            <div className="mt-8 border border-[var(--public-border)] bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#201e1d]">
                <ExternalLink className="h-5 w-5 text-[#ec3013]" />
                Sources
              </h3>
              <ul className="space-y-3">
                {article.sources.map((source, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center bg-[#ffe0d9] text-xs font-semibold text-[#ae1800]">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1 text-sm font-semibold text-[#ec3013] hover:text-[#ae1800]"
                      >
                        {source.name}
                        <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                      <p className="mt-1 text-xs text-[#9b9797] break-all">{source.url}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ArticleEngagement articleId={article.id} />

          {relatedArticles.length > 0 && (
            <section className="mt-12 border-t border-[#d7d3d3] pt-12">
              <h2 className="mb-6 text-2xl font-extrabold text-[#201e1d]">
                Articles similaires
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="h-[28rem] lg:sticky lg:top-[5.25rem] lg:h-[calc(100dvh-7rem)]">
          <NewsFil articles={latestArticles} />
        </aside>
        </div>
      </div>
    </PublicShell>
  );
}
