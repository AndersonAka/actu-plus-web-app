import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/organisms';
import { ArticleCard } from '@/components/molecules';
import { Badge } from '@/components/atoms';
import { apiConfig } from '@/config/api.config';
import { Article, ArticleStatus } from '@/types';
import { Globe } from 'lucide-react';

interface PageProps {
  params: Promise<{ code: string }>;
}

function mapArticle(data: any): Article {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: data.imageUrl,
    category: data.category,
    country: data.country,
    author: data.author,
    status: data.isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
    isFeatured: data.isFeatured,
    isPremium: data.isPremium || false,
    views: data.views || 0,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

async function getCountryArticles(countryCode: string): Promise<Article[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles?countryCode=${countryCode.toUpperCase()}&isPublished=true&limit=20`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const result = await response.json();
    const articles = result.data?.data || [];
    return articles.map(mapArticle);
  } catch (error) {
    console.error('Error fetching country articles:', error);
    return [];
  }
}

async function getCountryInfo(countryCode: string) {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/countries`,
      { cache: 'no-store' }
    );
    if (!response.ok) return null;
    const result = await response.json();
    const countries = result.data || result || [];
    return countries.find((c: any) => c.code.toLowerCase() === countryCode.toLowerCase());
  } catch (error) {
    console.error('Error fetching country info:', error);
    return null;
  }
}

export default async function CountryPage({ params }: PageProps) {
  const { code } = await params;
  const [articles, countryInfo] = await Promise.all([
    getCountryArticles(code),
    getCountryInfo(code),
  ]);

  if (!countryInfo) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-500 to-primary-700 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Globe className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {countryInfo.name}
                </h1>
                <p className="mt-2 text-primary-100">
                  Toutes les actualités de {countryInfo.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Articles récents
              </h2>
              <Badge variant="primary">
                {articles.length} article{articles.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article}
                    fromCountry={code}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Aucun article disponible
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Il n'y a pas encore d'articles publiés pour {countryInfo.name}.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
