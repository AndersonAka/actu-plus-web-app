'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Article, ArticleSection } from '@/types/article.types';
import { ArticleCard } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { PublicShell } from '../../PublicShell';
import {
  Lock,
  Newspaper,
  TrendingUp,
  Star,
  Clock,
  Globe2,
  LayoutGrid,
  List,
  FileText,
  Radar,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { stripAllLinks, sanitizeArticleContent, isInternalPrivateLink } from '@/lib/articles/sanitize-content';
import { SECTOR_LABELS } from '@/lib/articles/article-labels';

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

function htmlToText(html: string, maxLength = 220): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

export default function CountryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params.code as string;
  const { user, isAuthenticated } = useAuth();

  const [country, setCountry] = useState<CountryData | null>(null);
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);
  const [summary, setSummary] = useState<Article | null>(null);
  const [essentielArticles, setEssentielArticles] = useState<Article[]>([]);
  const [essentielPage, setEssentielPage] = useState(1);
  const [essentielTotal, setEssentielTotal] = useState(0);
  const [essentielLoading, setEssentielLoading] = useState(false);
  const [essentielCategoryFilter, setEssentielCategoryFilter] = useState<string | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allPage, setAllPage] = useState(1);
  const [allTotal, setAllTotal] = useState(0);
  const [allLoadingMore, setAllLoadingMore] = useState(false);
  const [focusArticle, setFocusArticle] = useState<Article | null>(null);
  const [chroniqueArticle, setChroniqueArticle] = useState<Article | null>(null);
  const [veilleSectorielleArticle, setVeilleSectorielleArticle] = useState<Article | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>(
    searchParams.get('tab') === 'chronique' ? 'resume' : searchParams.get('tab') || 'resume'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [canAccessCountryPage, setCanAccessCountryPage] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const ESSENTIEL_LIMIT = 12;
  const ALL_LIMIT = 20;

  // Check if user is staff (admin, veilleur, moderateur)
  const isStaff = user?.role && ['admin', 'veilleur', 'moderateur'].includes(user.role.toLowerCase());

  // Vérifier l'accès via l'API (abonnement actif ou staff)
  useEffect(() => {
    const checkAccess = async () => {
      // Staff a toujours accès
      if (isStaff) {
        setCanAccessCountryPage(true);
        setCheckingAccess(false);
        return;
      }

      // Non authentifié = pas d'accès
      if (!isAuthenticated) {
        setCanAccessCountryPage(false);
        setCheckingAccess(false);
        return;
      }

      // Vérifier l'abonnement via l'API
      try {
        const response = await fetch('/api/proxy/subscriptions/active', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCanAccessCountryPage(data.hasActiveSubscription || false);
        } else {
          setCanAccessCountryPage(false);
        }
      } catch {
        setCanAccessCountryPage(false);
      }
      setCheckingAccess(false);
    };

    checkAccess();
  }, [isAuthenticated, isStaff]);

  useEffect(() => {
    const fetchCountryData = async () => {
      if (!code) return;

      setLoading(true);
      setEssentielCategoryFilter(null);
      setSectorFilter(null);
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

        // Fetch all sections in parallel (today-only for daily sections)
        const [summaryRes, essentielRes, allRes, focusRes, chroniquesRes, veilleSectorielleRes] = await Promise.all([
          fetch(`/api/proxy/articles/country/${code}/summary`),
          fetch(`/api/proxy/articles/country/${code}/essentiel?limit=${ESSENTIEL_LIMIT}&page=1&publishedToday=true`),
          fetch(`/api/proxy/articles/country/${code}/all?limit=${ALL_LIMIT}&page=1&publishedToday=true`),
          fetch(`/api/proxy/articles/country/${code}/focus`),
          fetch(`/api/proxy/articles/country/${code}/chroniques?limit=1`),
          fetch(`/api/proxy/articles/country/${code}/veille-sectorielle`),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data.data ? mapArticle(data.data) : null);
        }

        if (essentielRes.ok) {
          const data = await essentielRes.json();
          const articles = data.data?.data || data.data || [];
          setEssentielArticles(mapArticles(articles));
          setEssentielTotal(data.data?.total || data.total || articles.length);
          setEssentielPage(1);
        }

        if (allRes.ok) {
          const data = await allRes.json();
          // PaginatedResultDto: { data: [...], total, page, limit }
          const articles = data.data?.data || data.data?.items || data.data || [];
          setAllArticles(mapArticles(articles));
          setAllTotal(data.data?.total || data.total || articles.length);
          setAllPage(1);
        }

        // Focus - support single article or array response
        if (focusRes.ok) {
          const data = await focusRes.json();
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

        // Veille Sectorielle - single article (like Focus)
        if (veilleSectorielleRes.ok) {
          const data = await veilleSectorielleRes.json();
          let veilleSectorielleData = null;
          if (data.data) {
            if (Array.isArray(data.data)) {
              veilleSectorielleData = data.data[0] || null;
            } else {
              veilleSectorielleData = data.data;
            }
          } else if (Array.isArray(data)) {
            veilleSectorielleData = data[0] || null;
          }
          setVeilleSectorielleArticle(veilleSectorielleData ? mapArticle(veilleSectorielleData) : null);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [code]);

  // Fonction pour charger plus d'articles L'Essentiel
  const loadMoreEssentiel = async () => {
    if (essentielLoading) return;

    setEssentielLoading(true);
    try {
      const nextPage = essentielPage + 1;
      const res = await fetch(
        `/api/proxy/articles/country/${code}/essentiel?limit=${ESSENTIEL_LIMIT}&page=${nextPage}&publishedToday=true`
      );

      if (res.ok) {
        const data = await res.json();
        const newArticles = data.data?.data || data.data || [];
        setEssentielArticles(prev => [...prev, ...mapArticles(newArticles)]);
        setEssentielPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more essentiel articles:', error);
    } finally {
      setEssentielLoading(false);
    }
  };

  // Fonction pour charger plus d'articles Toute l'actualité
  const loadMoreAll = async () => {
    if (allLoadingMore) return;

    setAllLoadingMore(true);
    try {
      const nextPage = allPage + 1;
      const res = await fetch(
        `/api/proxy/articles/country/${code}/all?limit=${ALL_LIMIT}&page=${nextPage}&publishedToday=true`
      );

      if (res.ok) {
        const data = await res.json();
        const newArticles = data.data?.data || data.data?.items || data.data || [];
        setAllArticles(prev => [...prev, ...mapArticles(newArticles)]);
        setAllPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
    } finally {
      setAllLoadingMore(false);
    }
  };

  const hasMoreEssentiel = essentielArticles.length < essentielTotal;
  const hasMoreAll = allArticles.length < allTotal;

  if (loading) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 w-64 bg-[#eae9e9]" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-[#eae9e9]" />
              ))}
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  const sections = [
    { id: 'resume', label: "Résumé de l'actualité", icon: FileText, premium: true },
    { id: 'essentiel', label: "L'Essentiel", icon: Star, premium: false },
    { id: 'focus', label: 'Focus', icon: TrendingUp, premium: false },
    { id: 'veille-sectorielle', label: 'Veille Sectorielle', icon: Radar, premium: false },
    { id: 'toute-actualite', label: "Toute l'actualité", icon: LayoutGrid, premium: false },
  ];

  const countryLabel = country?.name || code.toUpperCase();

  const essentielCategories = Array.from(
    new Map(
      essentielArticles.filter((a) => a.category).map((a) => [a.category!.id, a.category!])
    ).values()
  );
  const filteredEssentiel = essentielCategoryFilter
    ? essentielArticles.filter((a) => a.category?.id === essentielCategoryFilter)
    : essentielArticles;

  const activeSectors = veilleSectorielleArticle?.summaryItems
    ? Array.from(new Set(veilleSectorielleArticle.summaryItems.map((i) => i.sector).filter(Boolean) as string[]))
    : [];
  const filteredVeilleItems = veilleSectorielleArticle?.summaryItems
    ? sectorFilter
      ? veilleSectorielleArticle.summaryItems.filter((it) => it.sector === sectorFilter)
      : veilleSectorielleArticle.summaryItems
    : [];

  const sujetsCount = summary?.summaryItems?.length ?? (summary ? 1 : 0);
  const focusNotesCount = focusArticle ? 1 : 0;

  const tabMetaLabel = (() => {
    switch (activeSection) {
      case 'resume':
        return `${sujetsCount} SUJET${sujetsCount > 1 ? 'S' : ''}`;
      case 'essentiel':
        return essentielTotal > 0 ? `${essentielArticles.length} SUR ${essentielTotal} ARTICLES` : '';
      case 'focus':
        return `${focusNotesCount} NOTE${focusNotesCount > 1 ? 'S' : ''}`;
      case 'veille-sectorielle':
        return `${activeSectors.length} FILIÈRE${activeSectors.length > 1 ? 'S' : ''} ACTIVE${activeSectors.length > 1 ? 'S' : ''}`;
      case 'toute-actualite':
        return allTotal > 0 ? `${allTotal} ARTICLE${allTotal > 1 ? 'S' : ''}` : '';
      default:
        return '';
    }
  })();

  // « Dernière mise à jour » calculée à partir des contenus réellement récupérés (aucune donnée inventée)
  const lastUpdatedTimestamps = [
    summary?.publishedAt || summary?.createdAt,
    essentielArticles[0]?.publishedAt || essentielArticles[0]?.createdAt,
    allArticles[0]?.publishedAt || allArticles[0]?.createdAt,
    focusArticle?.publishedAt || focusArticle?.createdAt,
    veilleSectorielleArticle?.publishedAt || veilleSectorielleArticle?.createdAt,
  ].filter(Boolean) as string[];
  const lastUpdatedLabel = lastUpdatedTimestamps.length > 0
    ? formatDistanceToNow(
        new Date(Math.max(...lastUpdatedTimestamps.map((d) => new Date(d).getTime()))),
        { locale: fr, addSuffix: true }
      )
    : null;
  const editionDateLabel = format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr });

  const renderSectionHeader = (title: string, description: string, extra?: React.ReactNode) => (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#d7d3d3] pb-5">
      <div>
        <h2 className="mb-1 text-2xl font-extrabold text-[#201e1d]">{title}</h2>
        <p className="text-sm text-[#605d5d]">{description}</p>
      </div>
      {extra && <div className="flex flex-wrap items-center gap-3">{extra}</div>}
    </div>
  );

  const renderPremiumLock = () => (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#d7d3d3] bg-[#f8f4f4] p-8 text-center">
      <Lock className="mb-4 h-12 w-12 text-[#9b9797]" />
      <h3 className="mb-2 text-lg font-bold text-[#201e1d]">Contenu Abonné</h3>
      <p className="mb-4 text-sm text-[#605d5d]">
        Cette section est réservée aux abonnés.
      </p>
      <Link href="/subscriptions">
        <Button variant="modernist">S'abonner</Button>
      </Link>
    </div>
  );

  const renderArticleList = (articles: Article[], emptyMessage: string) => {
    if (articles.length === 0) {
      return (
        <p className="text-center text-[#9b9797] py-4">{emptyMessage}</p>
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
    <div className="flex items-center gap-1 border border-[#d7d3d3] bg-[#f8f4f4] p-1">
      <button
        onClick={() => setViewMode('grid')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors ${
          viewMode === 'grid'
            ? 'bg-[#201e1d] text-white'
            : 'text-[#605d5d] hover:text-[#201e1d]'
        }`}
        title="Affichage grille"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Grille</span>
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors ${
          viewMode === 'list'
            ? 'bg-[#201e1d] text-white'
            : 'text-[#605d5d] hover:text-[#201e1d]'
        }`}
        title="Affichage liste"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">Liste</span>
      </button>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'resume': {
        if (!canAccessCountryPage) {
          return (
            <>
              {renderSectionHeader("Résumé de l'actualité", `Ce qu'il faut retenir de la presse ${countryLabel} ce matin, classé par thème.`)}
              {renderPremiumLock()}
            </>
          );
        }
        const items = summary?.summaryItems;
        const summaryTime = summary?.publishedAt || summary?.createdAt
          ? format(new Date(summary.publishedAt || summary.createdAt), "HH'h'mm")
          : null;
        return (
          <>
            {renderSectionHeader("Résumé de l'actualité", `Ce qu'il faut retenir de la presse ${countryLabel} ce matin, classé par thème.`)}
            {items && items.length > 0 ? (
              <div className="divide-y divide-[#d7d3d3]">
                {items.map((item, index) => (
                  <div key={index} className={index === 0 ? 'pb-6' : 'py-6'}>
                    <div className="mb-2">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ec3013]">
                        {item.categoryName || 'Actualité'}
                      </div>
                      {summaryTime && (
                        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9b9797]">
                          {summaryTime}
                        </div>
                      )}
                    </div>
                    <h3 className="mb-2 text-xl font-extrabold text-[#201e1d]">{item.title}</h3>
                    <div
                      className="mb-2 text-sm leading-relaxed text-[#605d5d]"
                      dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(item.summary) }}
                    />
                    {item.link && !isInternalPrivateLink(item.link) && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#ae1800] hover:text-[#ec3013]"
                      >
                        En savoir plus →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : summary?.content ? (
              <div
                className="article-content max-w-none text-sm leading-relaxed text-[#605d5d]"
                dangerouslySetInnerHTML={{ __html: stripAllLinks(summary.content) }}
              />
            ) : (
              <p className="text-center text-[#9b9797]">Aucun résumé disponible pour aujourd'hui.</p>
            )}
          </>
        );
      }

      case 'veille-sectorielle': {
        const veilleTime = veilleSectorielleArticle?.publishedAt || veilleSectorielleArticle?.createdAt
          ? format(new Date(veilleSectorielleArticle.publishedAt || veilleSectorielleArticle.createdAt), "HH'h'mm")
          : null;
        return (
          <>
            {renderSectionHeader('Veille sectorielle', `Suivi quotidien des filières stratégiques en ${countryLabel}.`)}
            {!veilleSectorielleArticle?.summaryItems || veilleSectorielleArticle.summaryItems.length === 0 ? (
              <p className="text-center text-[#9b9797]">Aucune veille sectorielle disponible pour aujourd'hui.</p>
            ) : filteredVeilleItems.length === 0 ? (
              <p className="text-center text-[#9b9797]">Aucune entrée pour cette filière aujourd'hui.</p>
            ) : (
              <div className="divide-y divide-[#d7d3d3]">
                {filteredVeilleItems.map((item, index) => (
                  <div key={index} className={index === 0 ? 'pb-6' : 'py-6'}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ec3013]">
                          {item.sector ? SECTOR_LABELS[item.sector] : 'Veille sectorielle'}
                        </div>
                        {veilleTime && (
                          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9b9797]">
                            {veilleTime}
                          </div>
                        )}
                      </div>
                      {veilleSectorielleArticle?.isPremium && (
                        <span className="bg-[#ffe0d9] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#ae1800]">Pro</span>
                      )}
                    </div>
                    <h3 className="mb-2 text-xl font-extrabold text-[#201e1d]">{item.title}</h3>
                    <div
                      className="mb-2 text-sm leading-relaxed text-[#605d5d]"
                      dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(item.summary) }}
                    />
                    {item.link && !isInternalPrivateLink(item.link) && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#ae1800] hover:text-[#ec3013]"
                      >
                        En savoir plus →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }

      case 'essentiel': {
        const chips = (
          <div className="flex flex-wrap border border-[#201e1d]">
            <button
              onClick={() => setEssentielCategoryFilter(null)}
              className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-colors ${
                essentielCategoryFilter === null ? 'bg-[#201e1d] text-white' : 'text-[#201e1d] hover:bg-[#f8f4f4]'
              }`}
            >
              Tout
            </button>
            {essentielCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setEssentielCategoryFilter(cat.id)}
                className={`border-l border-[#201e1d] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-colors ${
                  essentielCategoryFilter === cat.id ? 'bg-[#201e1d] text-white' : 'text-[#201e1d] hover:bg-[#f8f4f4]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        );
        return (
          <>
            {renderSectionHeader("L'Essentiel", "Les articles marquants de l'édition, sélectionnés par la rédaction.", essentielCategories.length > 0 ? chips : undefined)}
            {renderArticleList(filteredEssentiel, "Aucun article essentiel pour aujourd'hui.")}
            {hasMoreEssentiel && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="modernist-outline"
                  onClick={loadMoreEssentiel}
                  disabled={essentielLoading}
                  className="min-w-[200px]"
                >
                  {essentielLoading ? 'Chargement...' : 'Voir plus d\'articles'}
                </Button>
              </div>
            )}
          </>
        );
      }

      case 'focus': {
        const previewText = focusArticle?.excerpt || (focusArticle?.content ? htmlToText(focusArticle.content) : '');
        const focusUrl = focusArticle
          ? `/articles/${focusArticle.slug || focusArticle.id}?from=${code}`
          : '#';
        const focusDate = focusArticle?.publishedAt || focusArticle?.createdAt
          ? format(new Date(focusArticle.publishedAt || focusArticle.createdAt), 'dd MMMM', { locale: fr })
          : null;
        return (
          <>
            {renderSectionHeader('Focus', 'Notre note d\'analyse sur les dossiers structurants du pays. Réservée aux abonnés Pro.')}
            {focusArticle ? (
              <div className="border border-[#201e1d]/40 bg-white p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#605d5d]">Note d'analyse</span>
                  {focusArticle.isPremium && (
                    <span className="bg-[#ffe0d9] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#ae1800]">Pro</span>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-extrabold text-[#201e1d]">{focusArticle.title}</h3>
                {previewText && (
                  <p className="mb-4 text-sm leading-relaxed text-[#605d5d]">{previewText}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {canAccessCountryPage ? (
                    <Link href={focusUrl}>
                      <Button variant="modernist-outline">Lire l'article complet</Button>
                    </Link>
                  ) : (
                    <Link href="/subscriptions">
                      <Button variant="modernist" leftIcon={<Crown className="h-4 w-4" />}>
                        Débloquer avec Pro
                      </Button>
                    </Link>
                  )}
                  {focusDate && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9b9797]">
                      Publié le {focusDate}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-[#9b9797]">Aucun article Focus pour aujourd'hui.</p>
            )}
          </>
        );
      }

      case 'chronique':
        if (!canAccessCountryPage) return renderPremiumLock();
        return chroniqueArticle ? (
          <ArticleCard article={chroniqueArticle} fromCountry={code} />
        ) : (
          <p className="text-center text-[#9b9797]">
            Aucune chronique pour le moment.
          </p>
        );

      case 'toute-actualite':
        return (
          <>
            {renderSectionHeader("Toute l'actualité", "L'ensemble des publications du jour, dans l'ordre chronologique.")}
            {allArticles.length === 0 ? (
              <p className="text-center text-[#9b9797] py-4">Aucun article pour aujourd'hui.</p>
            ) : (
              <div className="divide-y divide-[#d7d3d3]">
                {allArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="compact" fromCountry={code} className="py-4 first:pt-0" />
                ))}
              </div>
            )}
            {hasMoreAll && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="modernist-outline"
                  onClick={loadMoreAll}
                  disabled={allLoadingMore}
                  className="min-w-[200px]"
                >
                  {allLoadingMore ? 'Chargement...' : `Charger ${ALL_LIMIT} articles de plus`}
                </Button>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  // Si l'utilisateur n'a pas accès, afficher un message de restriction
  if (!loading && !checkingAccess && !canAccessCountryPage) {
    return (
      <PublicShell>
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="w-full max-w-md border border-[#201e1d]/40 bg-white p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#ffe0d9]">
              <Lock className="h-10 w-10 text-[#ec3013]" />
            </div>
            <h1 className="mb-2 text-2xl font-extrabold text-[#201e1d]">
              Abonnement requis
            </h1>
            <p className="mb-6 text-[#605d5d]">
              Pour accéder aux pages pays et à tout leur contenu, vous devez avoir un abonnement actif.
            </p>
            <div className="space-y-3">
              <div>
                <Link href="/subscriptions">
                  <Button variant="modernist" className="w-full justify-center">
                    Voir les formules d'abonnement
                  </Button>
                </Link>
              </div>
              <div>
                <Link href="/">
                  <Button variant="modernist-outline" className="w-full justify-center">
                    Retour à l'accueil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      {/* Hero Banner */}
      <div className="relative border-b-2 border-[#201e1d] bg-[#ec3013] text-white overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffe0d9]">
                Zone pays · Revue de la presse
              </div>
              <h1 className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {countryLabel}
              </h1>
              <p className="text-sm text-[#ffe0d9] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Édition du {editionDateLabel}
                {lastUpdatedLabel ? ` · dernière mise à jour ${lastUpdatedLabel}` : ''}
              </p>
            </div>

            {/* Country Flags Navigation */}
            {allCountries.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allCountries.map((c) => (
                  <Link
                    key={c.id}
                    href={`/country/${c.code.toLowerCase()}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold transition-colors ${
                      c.code.toLowerCase() === code.toLowerCase()
                        ? 'bg-white text-[#ae1800]'
                        : 'bg-white/90 text-[#201e1d] hover:bg-white'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#201e1d]/40">
          <div className="flex flex-wrap">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-[#ec3013] shadow-[inset_0_-3px_0_#ec3013]'
                      : 'text-[#605d5d] hover:text-[#201e1d]'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {section.label}
                  {section.id === 'veille-sectorielle' && (
                    <span className="bg-[#ffe0d9] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[#ae1800]">
                      Pro
                    </span>
                  )}
                  {section.premium && !canAccessCountryPage && (
                    <Lock className="h-3 w-3 text-[#9b9797]" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            {tabMetaLabel && (
              <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-[#9b9797]">
                {tabMetaLabel}
              </span>
            )}
            {activeSection === 'essentiel' && renderViewToggle()}
          </div>
        </div>

        {/* Active Section Content (layout varies by tab) */}
        {activeSection === 'veille-sectorielle' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
            <aside className="h-fit border border-[#d7d3d3] bg-white p-2">
              <div className="px-3 pt-2 pb-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#9b9797]">
                Filières
              </div>
              <button
                onClick={() => setSectorFilter(null)}
                className={`block w-full px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  sectorFilter === null ? 'bg-[#201e1d] text-white' : 'text-[#201e1d] hover:bg-[#f8f4f4]'
                }`}
              >
                Toutes
              </button>
              {Object.entries(SECTOR_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSectorFilter(value)}
                  className={`block w-full px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    sectorFilter === value ? 'bg-[#201e1d] text-white' : 'text-[#201e1d] hover:bg-[#f8f4f4]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </aside>
            <div className="border border-[#d7d3d3] bg-white p-6">{renderSection()}</div>
          </div>
        ) : activeSection === 'toute-actualite' ? (
          <div className="border border-[#d7d3d3] bg-white p-6">{renderSection()}</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
            <div className="border border-[#d7d3d3] bg-white p-6">{renderSection()}</div>
            {focusArticle && (
              <aside className="h-fit border border-[#d7d3d3] bg-white p-5">
                <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#9b9797]">
                  Focus en cours
                </div>
                <button onClick={() => setActiveSection('focus')} className="group block text-left">
                  <h4 className="mb-2 text-sm font-extrabold leading-snug text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
                    {focusArticle.title}
                  </h4>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9b9797]">
                    Note{focusArticle.isPremium ? ' · Pro' : ''}
                  </span>
                </button>
              </aside>
            )}
          </div>
        )}

        {/* Autres Pays Section - Minimaliste */}
        {allCountries.length > 1 && (
          <section className="mt-10 py-6 border-t border-[#d7d3d3]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#9b9797] flex items-center gap-2">
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
                    className="flex items-center gap-2 border border-[#d7d3d3] bg-white px-3 py-1.5 text-sm text-[#201e1d] hover:border-[#ec3013] hover:text-[#ec3013] transition-colors"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
