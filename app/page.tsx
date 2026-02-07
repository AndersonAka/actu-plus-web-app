import Link from 'next/link';
import { Button, Badge } from '@/components/atoms';
import { ArticleCard, FeaturedCarousel, SummarySection, FloatingCTA } from '@/components/molecules';
import { Header, Footer } from '@/components/organisms';
import { apiConfig } from '@/config/api.config';
import { Article, ArticleStatus } from '@/types';
import { HomePageClient } from './HomePageClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Mapper les données du backend vers le type Article du frontend
function mapArticle(data: any): Article {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: data.imageUrl, // Backend utilise imageUrl
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

async function getFeaturedArticles(): Promise<Article[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles?isFeatured=true&limit=5`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const result = await response.json();
    const articles = result.data?.data || [];
    return articles.map(mapArticle);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

async function getFocusArticles(): Promise<Article[]> {
  try {
    // Try with articleSection parameter (backend may use this or 'section')
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles?articleSection=focus&limit=6`,
      { cache: 'no-store' }
    );
    
    console.log('[Home] Focus articles response status:', response.status);
    
    if (!response.ok) return [];
    
    const result = await response.json();
    console.log('[Home] Focus articles raw result:', result);
    
    // Handle multiple response structures
    let articles: any[] = [];
    if (Array.isArray(result)) {
      articles = result;
    } else if (Array.isArray(result.data)) {
      articles = result.data;
    } else if (result.data?.data && Array.isArray(result.data.data)) {
      articles = result.data.data;
    } else if (result.data?.items && Array.isArray(result.data.items)) {
      articles = result.data.items;
    }
    
    console.log('[Home] Focus articles parsed count:', articles.length);
    return articles.map(mapArticle);
  } catch (error) {
    console.error('Error fetching focus articles:', error);
    return [];
  }
}

interface CountrySummary {
  countryCode: string;
  countryName: string;
  summary: any;
}

async function getSummariesByCountry(): Promise<CountrySummary[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles/summaries-by-country`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const result = await response.json();
    return result.data || result || [];
  } catch (error) {
    console.error('Error fetching summaries by country:', error);
    return [];
  }
}

export default async function HomePage() {
  const [featuredArticles, focusArticles, summariesByCountry] = await Promise.all([
    getFeaturedArticles(),
    getFocusArticles(),
    getSummariesByCountry(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-500 to-primary-700 py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
                Bienvenue sur Actu Plus
              </h1>
              <p className="mx-auto max-w-2xl text-base text-primary-100">
                Votre source d'actualités fiable et complète. Restez informé avec
                les dernières nouvelles d'Afrique de l'Ouest.
              </p>
            </div>
          </div>
        </section>

        {/* Country Tabs */}
        <HomePageClient />

        {/* Featured Carousel - À la une */}
        <section className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">À la une</h2>
            </div>
            {featuredArticles.length > 0 ? (
              <FeaturedCarousel articles={featuredArticles} />
            ) : (
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <span className="text-6xl font-bold opacity-20">A+</span>
                  <p className="mt-4 text-lg">Aucun article à la une</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Summary Section - Résumé de l'actualité par pays */}
        <SummarySection summaries={summariesByCountry} />

        {/* Focus Articles Grid */}
        <section className="bg-gray-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Focus
              </h2>
              <Link
                href="/articles?section=focus"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Voir tout →
              </Link>
            </div>
            {focusArticles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {focusArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-8 text-center">
                <p className="text-gray-500">Aucun article Focus disponible pour le moment.</p>
                <p className="mt-2 text-sm text-gray-400">
                  Revenez bientôt pour découvrir nos analyses approfondies.
                </p>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
      
      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
}
