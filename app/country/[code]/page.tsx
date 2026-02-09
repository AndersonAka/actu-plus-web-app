'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article, ArticleSection, CountrySummary } from '@/types/article.types';
import { ArticleCard, FocusDetailCard } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { Header, Footer } from '@/components/organisms';
import { 
  Lock, 
  ChevronRight, 
  Newspaper, 
  TrendingUp, 
  BookOpen, 
  Archive, 
  Star,
  Clock,
  Eye,
  Sparkles,
  Globe2,
  ArrowRight,
  Megaphone,
  LayoutGrid,
  List
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface CountryData {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

// Mapper les données du backend vers le type Article du frontend
function mapArticle(data: any): Article {
  return {
    ...data,
    coverImage: data.imageUrl || data.coverImage,
  };
}

function mapArticles(articles: any): Article[] {
  if (!Array.isArray(articles)) return [];
  return articles.map(mapArticle);
}

export default function CountryPage() {
  const params = useParams();
  const code = params.code as string;
  const { user, isAuthenticated } = useAuth();
  
  const [country, setCountry] = useState<CountryData | null>(null);
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [summary, setSummary] = useState<Article | null>(null);
  const [essentielArticles, setEssentielArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [archiveArticles, setArchiveArticles] = useState<Article[]>([]);
  const [focusArticle, setFocusArticle] = useState<Article | null>(null);
  const [chroniqueArticle, setChroniqueArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('essentiel');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Check if user is staff (admin, veilleur, moderateur)
  const isStaff = user?.role && ['admin', 'veilleur', 'moderateur'].includes(user.role.toLowerCase());
  
  // Check if user has premium access (staff or premium subscription)
  const hasPremiumAccess = isStaff || user?.subscription?.tier === 'premium' || user?.subscription?.tier === 'enterprise';
  
  // Check if user has active subscription or is staff
  const hasActiveSubscription = user?.subscription?.status === 'active';
  const canAccessCountryPage = isStaff || hasActiveSubscription;

  useEffect(() => {
    const fetchCountryData = async () => {
      if (!code) return;
      
      setLoading(true);
      try {
        // Fetch country info and all countries
        const [countryRes, allCountriesRes] = await Promise.all([
          fetch(`/api/proxy/countries/code/${code.toUpperCase()}`),
          fetch('/api/proxy/countries'),
        ]);
        
        if (countryRes.ok) {
          const countryData = await countryRes.json();
          setCountry(countryData.data);
        }
        
        if (allCountriesRes.ok) {
          const countriesData = await allCountriesRes.json();
          setAllCountries(Array.isArray(countriesData) ? countriesData : countriesData.data || []);
        }

        // Fetch all sections in parallel
        const [summaryRes, essentielRes, allRes, archivesRes, focusRes, chroniquesRes] = await Promise.all([
          fetch(`/api/proxy/articles/country/${code}/summary`),
          fetch(`/api/proxy/articles/country/${code}/essentiel?limit=6`),
          fetch(`/api/proxy/articles/country/${code}/all?limit=10`),
          fetch(`/api/proxy/articles/country/${code}/archives?limit=6`),
          fetch(`/api/proxy/articles/country/${code}/focus`),
          fetch(`/api/proxy/articles/country/${code}/chroniques?limit=6`),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data.data ? mapArticle(data.data) : null);
        }

        if (essentielRes.ok) {
          const data = await essentielRes.json();
          setEssentielArticles(mapArticles(data.data || []));
        }

        if (allRes.ok) {
          const data = await allRes.json();
          // PaginatedResultDto: { data: [...], total, page, limit }
          const articles = data.data?.data || data.data?.items || data.data || [];
          setAllArticles(mapArticles(articles));
        }

        // Archives - support multiple response formats
        if (archivesRes.ok) {
          const data = await archivesRes.json();
          console.log('[Country Page] Archives response:', data);
          // Handle different response structures
          let articles: any[] = [];
          if (Array.isArray(data)) {
            articles = data;
          } else if (Array.isArray(data.data)) {
            articles = data.data;
          } else if (data.data?.data && Array.isArray(data.data.data)) {
            articles = data.data.data;
          } else if (data.data?.items && Array.isArray(data.data.items)) {
            articles = data.data.items;
          }
          setArchiveArticles(mapArticles(articles));
        }

        // Focus - support single article or array response
        if (focusRes.ok) {
          const data = await focusRes.json();
          console.log('[Country Page] Focus response:', data);
          let focusData = null;
          if (data.data) {
            // Could be single object or array
            if (Array.isArray(data.data)) {
              focusData = data.data[0] || null;
            } else {
              focusData = data.data;
            }
          } else if (Array.isArray(data)) {
            focusData = data[0] || null;
          }
          setFocusArticle(focusData ? mapArticle(focusData) : null);
        }

        // Chroniques - single article (like Focus)
        if (chroniquesRes.ok) {
          const data = await chroniquesRes.json();
          console.log('[Country Page] Chroniques response:', data);
          let chroniqueData = null;
          if (data.data) {
            if (Array.isArray(data.data)) {
              chroniqueData = data.data[0] || null;
            } else {
              chroniqueData = data.data;
            }
          } else if (Array.isArray(data)) {
            chroniqueData = data[0] || null;
          }
          setChroniqueArticle(chroniqueData ? mapArticle(chroniqueData) : null);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 rounded bg-gray-200" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'essentiel', label: "L'Essentiel", icon: Star, premium: false },
    { id: 'focus', label: 'Focus', icon: TrendingUp, premium: true },
    { id: 'chronique', label: 'Chroniques', icon: BookOpen, premium: true },
    { id: 'toute-actualite', label: "Toute l'actualité", icon: Newspaper, premium: false },
    { id: 'archives', label: 'Archives', icon: Archive, premium: false },
  ];

  const renderPremiumLock = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <Lock className="mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-semibold text-gray-700">Contenu Abonné</h3>
      <p className="mb-4 text-sm text-gray-500">
        Cette section est réservée aux abonnés.
      </p>
      <Link href="/subscriptions">
        <Button variant="primary">S'abonner</Button>
      </Link>
    </div>
  );

  const renderArticleList = (articles: Article[], emptyMessage: string) => {
    if (articles.length === 0) {
      return (
        <p className="text-center text-gray-500 py-4">{emptyMessage}</p>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="list" fromCountry={code} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} fromCountry={code} />
        ))}
      </div>
    );
  };

  const renderViewToggle = () => (
    <div className="mb-4 flex items-center justify-end">
      <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
            viewMode === 'grid'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Affichage grille"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Grille</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
            viewMode === 'list'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="Affichage liste"
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">Liste</span>
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'essentiel':
        return (
          <>
            {renderViewToggle()}
            {renderArticleList(essentielArticles, "Aucun article essentiel pour le moment.")}
          </>
        );

      case 'focus':
        if (!hasPremiumAccess) return renderPremiumLock();
        return focusArticle ? (
          <FocusDetailCard
            article={focusArticle}
            sectionTitle="Le Focus sur..."
            sectionColor="red"
            fromCountry={code}
          />
        ) : (
          <p className="text-center text-gray-500">Aucun article Focus pour le moment.</p>
        );

      case 'chronique':
        if (!hasPremiumAccess) return renderPremiumLock();
        return chroniqueArticle ? (
          <FocusDetailCard
            article={chroniqueArticle}
            sectionTitle="La Chronique"
            sectionColor="blue"
            fromCountry={code}
          />
        ) : (
          <p className="text-center text-gray-500">
            Aucune chronique pour le moment.
          </p>
        );

      case 'toute-actualite':
        return (
          <>
            {renderViewToggle()}
            {renderArticleList(allArticles, "Aucun article pour le moment.")}
          </>
        );

      case 'archives':
        return (
          <>
            {renderViewToggle()}
            {renderArticleList(archiveArticles, "Aucune archive pour le moment.")}
          </>
        );

      default:
        return null;
    }
  };

  // Si l'utilisateur n'a pas accès, afficher un message de restriction
  if (!loading && !canAccessCountryPage) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header />
        <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-16">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <Lock className="h-10 w-10 text-primary-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Abonnement requis
            </h1>
            <p className="mb-6 text-gray-600">
              Pour accéder aux pages pays et à tout leur contenu, vous devez avoir un abonnement actif.
            </p>
            <div className="space-y-3">
              <div>
                <Link  href="/subscriptions">
                  <Button variant="primary" className="w-full ">
                    Voir les formules d'abonnement
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              {country?.flag && (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-5xl shadow-lg">
                  {country.flag}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary-200" />
                  <span className="text-sm font-medium text-primary-200">Zone Pays</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {country?.name || code.toUpperCase()}
                </h1>
                <p className="mt-1 text-primary-100 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Actualités et analyses en temps réel
                </p>
              </div>
            </div>
          
            {/* Country Flags Navigation */}
            {allCountries.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-primary-200 mb-3">Explorer les autres pays :</p>
                <div className="flex flex-wrap gap-2">
                  {allCountries.map((c) => (
                    <Link
                      key={c.id}
                      href={`/country/${c.code.toLowerCase()}`}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                        c.code.toLowerCase() === code.toLowerCase()
                          ? 'bg-white text-primary-600 shadow-md'
                          : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                      }`}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span className="hidden sm:inline">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 -mt-6">

        {/* Summary Section */}
        {summary && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100">
                <Newspaper className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h2 className="mb-3 text-xl font-bold text-gray-900">
                  Résumé de l'actualité
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">{summary.excerpt || summary.content.substring(0, 500)}...</p>
                </div>
                <Link 
                  href={`/articles/${summary.slug}?from=${code}`} 
                  className="mt-4 inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium group"
                >
                  Lire la suite 
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Revue de la Presse Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Revue de la Presse</h2>
        </div>

        {/* Section Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 bg-gray-100/80 p-2 rounded-2xl">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-white text-primary-600 shadow-md scale-[1.02]'
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {section.label}
                {section.premium && !hasPremiumAccess && (
                  <Lock className="h-3 w-3 text-gray-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Section Content */}
        <section className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 animate-fade-in">
          {renderSection()}
        </section>

        {/* Section Publicité */}
        <section className="mt-10 rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-primary-600 font-medium">Espace publicitaire</p>
                <p className="text-xs text-primary-500">Contactez-nous pour annoncer ici</p>
              </div>
            </div>
            <Link 
              href="/contact" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              En savoir plus
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Autres Pays Section - Minimaliste */}
        {allCountries.length > 1 && (
          <section className="mt-10 py-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Globe2 className="h-4 w-4" />
                Autres pays
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allCountries
                .filter((c) => c.code.toLowerCase() !== code.toLowerCase())
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/country/${c.code.toLowerCase()}`}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </Link>
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
