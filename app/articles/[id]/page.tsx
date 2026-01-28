import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge, Button } from '@/components/atoms';
import { ArticleCard } from '@/components/molecules';
import { Header, Footer } from '@/components/organisms';
import { apiConfig } from '@/config/api.config';
import { Article, ArticleStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Eye, Share2, Crown } from 'lucide-react';
import { ArticleContent } from './ArticleContent';
import { BackButton } from './BackButton';

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
  };
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/articles/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const result = await response.json();
    // Structure: { success, data: {...}, timestamp }
    const articleData = result.data || result;
    return mapArticle(articleData);
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
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

  const relatedArticles = await getRelatedArticles(article.category?.id, article.id);

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd MMMM yyyy', { locale: fr })
    : format(new Date(article.createdAt), 'dd MMMM yyyy', { locale: fr });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <BackButton 
            countryCode={article.country?.code} 
            countryName={article.country?.name} 
          />

          <header className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="primary">{article.category?.name || 'Actualité'}</Badge>
              {article.country && (
                <Badge variant="secondary">{article.country.name}</Badge>
              )}
              {article.isPremium && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mb-4 text-lg text-gray-600">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views} vues
              </span>
            </div>
          </header>

          {article.coverImage && (
            <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <ArticleContent article={article} />

          <div className="mt-8 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Publié par {article.author.firstName} {article.author.lastName}
              </p>
              <Button variant="outline" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
                Partager
              </Button>
            </div>
          </div>

          {relatedArticles.length > 0 && (
            <section className="mt-12 border-t border-gray-200 pt-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Articles similaires
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
