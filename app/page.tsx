import Link from 'next/link';
import Image from 'next/image';
import { Archivo } from 'next/font/google';
import { apiConfig } from '@/config/api.config';
import { Article, ArticleStatus } from '@/types';
import { HomeCountrySwitcher } from './HomeCountrySwitcher';
import { HomeAuthButton } from './HomeAuthButton';
import { Search, ArrowRight } from 'lucide-react';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CONTACT_INFO } from '@/lib/constants/contact';

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '500', '600', '800'] });

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const SECTOR_LABELS: Record<string, string> = {
  'banque-assurance': 'Banque & assurance',
  energie: 'Énergie',
  'agro-industrielle': 'Agro-industrie',
};

function getTextPreview(html: string, maxLength: number = 160): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
    imageUrl: data.imageUrl,
    category: data.category,
    country: data.country,
    author: data.author,
    status: data.isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
    contentType: data.contentType,
    scope: data.scope,
    zone: data.zone,
    sector: data.sector,
    internationalCountryName: data.internationalCountryName,
    internationalCountryFlag: data.internationalCountryFlag,
    summaryItems: data.summaryItems,
    isFeatured: data.isFeatured,
    isFeaturedHome: data.isFeaturedHome,
    isPremium: data.isPremium || false,
    isArchive: data.isArchive || false,
    views: data.views || 0,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function extractArticles(result: any): any[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  return [];
}

async function getFeaturedArticles(): Promise<Article[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles/featured-home?limit=10&publishedToday=true`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    return extractArticles(await response.json()).map(mapArticle);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

async function getLatestArticles(): Promise<Article[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles?limit=6&sortBy=date&sortOrder=DESC`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    return extractArticles(await response.json()).map(mapArticle);
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

interface VeilleSectorielleEntry {
  articleId: string;
  articleSlug: string;
  sector?: string;
  title: string;
  summary: string;
  link?: string;
  publishedAt: string | null;
  country: { id: string; code: string; name: string; flag?: string } | null;
}

async function getVeilleSectorielleEntries(): Promise<VeilleSectorielleEntry[]> {
  try {
    const response = await fetch(
      `${apiConfig.baseUrl}/api/articles/veille-sectorielle/entries?limit=4`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const result = await response.json();
    const entries = result.data?.data || result.data || [];
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    console.error('Error fetching veille sectorielle entries:', error);
    return [];
  }
}

interface CountryListItem {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

async function getCountries(): Promise<CountryListItem[]> {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/countries`, { cache: 'no-store' });
    if (!response.ok) return [];
    const result = await response.json();
    const countries = result.data || result;
    return Array.isArray(countries) ? countries : [];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

async function getCategories(): Promise<CategoryItem[]> {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/categories`, { cache: 'no-store' });
    if (!response.ok) return [];
    const result = await response.json();
    const list = result.data || result;
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

interface CountryHeadlines extends CountryListItem {
  total: number;
  headlines: { id: string; title: string; slug: string }[];
}

async function getCountryHeadlines(countries: CountryListItem[]): Promise<CountryHeadlines[]> {
  return Promise.all(
    countries.map(async (country) => {
      try {
        const response = await fetch(
          `${apiConfig.baseUrl}/api/articles/country/${country.code.toLowerCase()}/all?limit=3`,
          { cache: 'no-store' }
        );
        if (!response.ok) return { ...country, total: 0, headlines: [] };
        const result = await response.json();
        const payload = result.data?.data !== undefined ? result.data : result;
        const items = Array.isArray(payload?.data) ? payload.data : [];
        return {
          ...country,
          total: payload?.total ?? items.length,
          headlines: items.slice(0, 3).map((a: any) => ({ id: a.id, title: a.title, slug: a.slug })),
        };
      } catch {
        return { ...country, total: 0, headlines: [] };
      }
    }),
  );
}

function relativeTime(date?: string): string | null {
  if (!date) return null;
  try {
    return formatDistanceToNow(new Date(date), { locale: fr, addSuffix: true });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [featuredArticles, latestArticles, veilleSectorielleEntries, countries, categories] = await Promise.all([
    getFeaturedArticles(),
    getLatestArticles(),
    getVeilleSectorielleEntries(),
    getCountries(),
    getCategories(),
  ]);

  const countryHeadlines = await getCountryHeadlines(countries);

  const [lead, ...secondary] = featuredArticles;
  const secondaryArticles = secondary.slice(0, 3);

  const economie = categories.find((c) => c.slug === 'economie');
  const politique = categories.find((c) => c.slug === 'politique');

  const leadCategoryLabel = lead?.category?.name || 'Actualité';
  const leadScopeLabel = lead?.scope === 'international' ? 'International' : 'National';
  const leadTime = relativeTime(lead?.publishedAt || lead?.createdAt);

  return (
    <div className={`${archivo.className} bg-[#f3f2f2] text-[#201e1d]`} style={{ fontSize: 15, lineHeight: 1.55 }}>
      <div className="mx-auto max-w-[1440px]">
        {/* MASTHEAD */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#201e1d]/40 px-5 py-5 sm:px-10">
          <Link href="/" className="shrink-0">
            <Image src="/images/logo-actu-plus.webp" alt="Actu Plus" width={180} height={57} priority unoptimized className="h-12 w-auto sm:h-14" />
          </Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <form action="/articles" method="GET" className="flex h-[42px] w-full max-w-[260px] items-center gap-2.5 border border-[#d7d3d3] bg-[#f8f4f4] px-4 text-sm text-[#605d5d]">
              <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
              <input
                type="text"
                name="search"
                placeholder="Rechercher un sujet, un pays…"
                className="w-full bg-transparent text-sm text-[#201e1d] placeholder:text-[#605d5d] focus:outline-none"
              />
            </form>
            <Link href="/favorites" className="flex h-[42px] items-center border border-[#201e1d] px-4 text-sm font-semibold text-[#201e1d] transition-colors hover:bg-[#eae9e9]">
              Favoris
            </Link>
            <Link href="/subscriptions" className="flex h-[42px] items-center bg-[#ec3013] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#dd2b0f]">
              S'abonner
            </Link>
            <HomeAuthButton />
          </div>
        </div>

        {/* NAV */}
        <div className="flex flex-wrap items-stretch justify-between gap-y-2 border-b-2 border-[#201e1d]/40 px-5 sm:px-10">
          <div className="flex flex-wrap items-stretch">
            <Link href="/" className="flex items-center py-3 pr-4.5 mr-4.5 text-sm font-extrabold shadow-[inset_0_-4px_0_#ec3013]">
              À la une
            </Link>
            {economie && (
              <Link href={`/articles?category=${economie.id}`} className="flex items-center px-4.5 py-3 text-sm transition-colors hover:bg-[#eae9e9]">
                Économie
              </Link>
            )}
            {politique && (
              <Link href={`/articles?category=${politique.id}`} className="flex items-center px-4.5 py-3 text-sm transition-colors hover:bg-[#eae9e9]">
                Politique
              </Link>
            )}
            <Link href="#revue-de-presse" className="flex items-center px-4.5 py-3 text-sm transition-colors hover:bg-[#eae9e9]">
              Revue de presse
            </Link>
            <Link href="/veille-sectorielle" className="flex items-center px-4.5 py-3 text-sm transition-colors hover:bg-[#eae9e9]">
              Veille sectorielle
            </Link>
            <Link href="/focus" className="flex items-center px-4.5 py-3 text-sm transition-colors hover:bg-[#eae9e9]">
              Focus
            </Link>
            <Link href="/archives" className="flex items-center px-4.5 py-3 text-sm transition-colors hover:bg-[#eae9e9]">
              Archives
            </Link>
          </div>
          <div className="flex items-center py-2">
            <HomeCountrySwitcher />
          </div>
        </div>

        {/* UNE + LE FIL */}
        <div className="grid grid-cols-1 border-b-2 border-[#201e1d]/40 lg:grid-cols-[1fr_360px]">
          <div className="lg:border-r-2 lg:border-[#201e1d]/40">
            {/* UNE */}
            <div className="border-b-2 border-[#201e1d]/40 px-5 py-8 sm:px-9 sm:py-10">
              {lead ? (
                <Link href={getArticlePublicPath(lead)} className="block">
                  <div className="mb-4.5 flex flex-wrap items-center gap-3.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ec3013]">
                      {leadCategoryLabel} · {leadScopeLabel}
                    </span>
                    <span className="h-px flex-1 bg-[#d7d3d3]" />
                    {leadTime && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#605d5d]">{leadTime}</span>
                    )}
                  </div>
                  {(lead.coverImage || lead.imageUrl) && (
                    <div className="mb-6 h-[240px] overflow-hidden sm:h-[340px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={lead.coverImage || lead.imageUrl} alt={lead.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <h1 className="mb-4 max-w-[20ch] text-[32px] font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-[56px]">
                    {lead.title}
                  </h1>
                  {lead.excerpt && (
                    <p className="max-w-[62ch] text-[17px] leading-[1.5] text-[#444141] sm:text-[19px]">{lead.excerpt}</p>
                  )}
                </Link>
              ) : (
                <p className="text-[#605d5d]">Aucun article à la une pour le moment.</p>
              )}
            </div>

            {/* 3 UNES SECONDAIRES */}
            {secondaryArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {secondaryArticles.map((article, i) => (
                  <Link
                    key={article.id}
                    href={getArticlePublicPath(article)}
                    className={`p-7 ${i < secondaryArticles.length - 1 ? 'border-b border-[#d7d3d3] sm:border-b-0 sm:border-r' : ''} ${i >= 2 ? 'border-t sm:border-t-0' : ''}`}
                  >
                    {(article.coverImage || article.imageUrl) && (
                      <div className="mb-4.5 h-[170px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={article.coverImage || article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ec3013]">
                      {article.category?.name || 'Actualité'}
                      {article.country?.name ? ` · ${article.country.name}` : ''}
                    </div>
                    <div className="mb-2.5 text-[22px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[26px]">
                      {article.title}
                    </div>
                    {article.excerpt && <div className="text-sm leading-[1.5] text-[#444141]">{article.excerpt}</div>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* LE FIL — TEMPS RÉEL */}
          <div className="px-5 py-7 sm:px-7">
            <div className="mb-4 flex items-baseline justify-between border-b-2 border-[#201e1d]/40 pb-3">
              <span className="text-sm font-extrabold uppercase tracking-[0.12em]">Le Fil</span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#ec3013]">Temps réel</span>
            </div>
            {latestArticles.length === 0 ? (
              <p className="text-sm text-[#605d5d]">Aucun article publié pour le moment.</p>
            ) : (
              <div className="divide-y divide-[#d7d3d3]">
                {latestArticles.map((article) => {
                  const publishedDate = article.publishedAt || article.createdAt;
                  const time = publishedDate ? format(new Date(publishedDate), "HH'h'mm") : null;
                  const tags = [article.country?.name, article.category?.name].filter(Boolean).join(' · ');
                  return (
                    <Link key={article.id} href={getArticlePublicPath(article)} className="group block py-4 first:pt-0">
                      {time && (
                        <div className="mb-1.5 text-[11px] font-extrabold text-[#ec3013]">{time}</div>
                      )}
                      <div className="mb-1.5 line-clamp-2 text-[15px] font-extrabold leading-tight text-[#201e1d] transition-colors group-hover:text-[#ec3013]">
                        {article.title}
                      </div>
                      {tags && (
                        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9b9797]">
                          {tags}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* REVUE DE PRESSE */}
        <div id="revue-de-presse" className="scroll-mt-4 px-5 py-11 sm:px-9 sm:py-12">
          <div className="mb-6.5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-extrabold leading-[1.05] tracking-[-0.022em] sm:text-[34px]">Revue de presse</h2>
              <div className="mt-2 text-[14.5px] text-[#605d5d]">Ce que disent les journaux du jour, pays par pays.</div>
            </div>
          </div>
          {countryHeadlines.length === 0 ? (
            <p className="border-t-2 border-[#201e1d]/40 py-8 text-center text-sm text-[#605d5d]">Aucun pays disponible.</p>
          ) : (
            <div className="grid grid-cols-1 border-t-2 border-b-2 border-[#201e1d]/40 sm:grid-cols-2 lg:grid-cols-3">
              {countryHeadlines.map((country, i) => (
                <div
                  key={country.id}
                  className={`p-6.5 ${i < countryHeadlines.length - 1 ? 'border-b border-[#d7d3d3] sm:border-b-0 sm:border-r' : ''}`}
                >
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-xl font-extrabold tracking-[-0.01em]">
                      {country.flag ? `${country.flag} ` : ''}{country.name}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605d5d]">
                      {country.total} titre{country.total !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {country.headlines.length > 0 ? (
                    <div className="grid gap-2.5 text-sm leading-[1.4] text-[#2d2b2b]">
                      {country.headlines.map((h) => (
                        <Link key={h.id} href={`/articles/${h.slug || h.id}`} className="grid grid-cols-[16px_1fr] hover:text-[#ec3013]">
                          <span className="font-extrabold text-[#ec3013]">·</span>
                          {h.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#9b9797]">Aucun article pour le moment.</p>
                  )}
                  <Link
                    href={`/country/${country.code.toLowerCase()}`}
                    className="mt-4.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#ae1800]"
                  >
                    Lire la synthèse <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BANNIÈRE PRO */}
        <div className="bg-[#ec3013] px-5 py-12 text-white sm:px-9 sm:py-14">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              <div className="mb-4.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ffe0d9]">Actu Plus Pro</div>
              <h2 className="mb-4.5 max-w-[24ch] text-[34px] font-extrabold leading-[1.0] tracking-[-0.03em] sm:text-[52px]">
                La veille que vos équipes lisent avant la réunion de 9 h.
              </h2>
              <p className="mb-7 max-w-[54ch] text-base leading-[1.55] text-[#ffe0d9]">
                Résumés quotidiens par pays, veille sur plusieurs filières, notes Focus et archives.
              </p>
              <Link href="/subscriptions" className="inline-flex h-[50px] items-center bg-[#201e1d] px-6 text-[15px] font-extrabold text-white transition-colors hover:bg-black">
                Découvrir Actu Plus Pro
              </Link>
            </div>
            <div className="grid gap-0 border-t-2 border-white/50">
              {[
                { n: '01', t: "Résumé de l'actualité", d: 'Une synthèse par pays, chaque matin.' },
                { n: '02', t: 'Veille sectorielle', d: 'Banque, énergie, agro-industrie…' },
                { n: '03', t: 'Notes Focus', d: 'Analyses longues sur les dossiers structurants.' },
                { n: '04', t: 'Archives', d: 'Recherche plein texte dans nos archives.' },
              ].map((item, i, arr) => (
                <div key={item.n} className={`grid grid-cols-[34px_1fr] gap-3.5 py-4 ${i < arr.length - 1 ? 'border-b border-white/35' : ''}`}>
                  <span className="text-[13px] font-extrabold text-[#ffc4b8]">{item.n}</span>
                  <div>
                    <div className="text-[15px] font-extrabold">{item.t}</div>
                    <div className="text-[13px] leading-[1.4] text-[#ffe0d9]">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VEILLE SECTORIELLE */}
        <div className="px-5 py-11 sm:px-9 sm:py-13">
          <div className="mb-5.5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[28px] font-extrabold leading-[1.05] tracking-[-0.022em] sm:text-[34px]">Veille sectorielle</h2>
            <div className="flex flex-wrap border border-[#201e1d]">
              <Link href="/veille-sectorielle" className="px-4 py-2 text-[13px] font-extrabold text-[#201e1d] transition-colors hover:bg-[#eae9e9]">
                Toutes
              </Link>
              {Object.entries(SECTOR_LABELS).map(([value, label]) => (
                <Link
                  key={value}
                  href={`/veille-sectorielle?sector=${value}`}
                  className="border-l border-[#201e1d] px-4 py-2 text-[13px] text-[#201e1d] transition-colors hover:bg-[#eae9e9]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {veilleSectorielleEntries.length === 0 ? (
            <p className="border-t-2 border-[#201e1d]/40 py-8 text-center text-sm text-[#605d5d]">
              Aucune veille sectorielle disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 border-t-2 border-[#201e1d]/40 sm:grid-cols-2">
              {veilleSectorielleEntries.map((entry, i) => (
                <div
                  key={`${entry.articleId}-${i}`}
                  className={`py-6.5 ${i % 2 === 0 ? 'sm:border-r sm:pr-7.5' : 'sm:pl-7.5'} ${i > 0 ? 'border-t border-[#d7d3d3] sm:border-t-0' : ''} ${i >= 2 ? 'sm:border-t sm:border-[#d7d3d3]' : ''}`}
                >
                  <div className="mb-3.5 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#605d5d]">
                      {entry.sector ? SECTOR_LABELS[entry.sector] : 'Veille sectorielle'}
                      {entry.country?.name ? ` · ${entry.country.name}` : ''}
                    </span>
                  </div>
                  <div className="mb-3 text-2xl font-extrabold leading-[1.1] tracking-[-0.018em]">{entry.title}</div>
                  <p className="text-sm leading-[1.55] text-[#444141]">{getTextPreview(entry.summary)}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Link
                      href={entry.country?.code ? `/country/${entry.country.code.toLowerCase()}?tab=veille-sectorielle` : `/articles/${entry.articleSlug}`}
                      className="flex h-11 items-center bg-[#ec3013] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#dd2b0f]"
                    >
                      Voir plus
                    </Link>
                    {entry.publishedAt && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#605d5d]">
                        {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(entry.publishedAt))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-[#201e1d] px-5 py-12 text-[#bab6b6] sm:px-9">
          <div className="grid grid-cols-1 gap-10 border-b-2 border-[#f3f2f2]/35 pb-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
            <div>
              <div className="mb-4 w-max bg-[#f3f2f2] px-3 py-2.5">
                <Image src="/images/logo-actu-plus.webp" alt="Actu Plus" width={130} height={41} unoptimized className="h-9 w-auto" />
              </div>
              <div className="max-w-[40ch] text-sm leading-[1.6]">
                Plateforme d'actualité et de veille dédiée à l'Afrique de l'Ouest. Sur le web et sur l'application mobile.
              </div>
            </div>
            <div>
              <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3f2f2]">Naviguer</div>
              <div className="grid gap-2.5 text-sm">
                <Link href="/" className="hover:text-white">À la une</Link>
                <Link href="/veille-sectorielle" className="hover:text-white">Veille sectorielle</Link>
                <Link href="/focus" className="hover:text-white">Focus</Link>
                <Link href="/archives" className="hover:text-white">Archives</Link>
              </div>
            </div>
            <div>
              <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3f2f2]">Offres</div>
              <div className="grid gap-2.5 text-sm">
                <Link href="/subscriptions" className="hover:text-white">Abonnement Pro</Link>
                <Link href="/about" className="hover:text-white">À propos</Link>
              </div>
            </div>
            <div>
              <div className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#f3f2f2]">Contact</div>
              <div className="grid gap-2.5 text-sm">
                <span>{CONTACT_INFO.email}</span>
                <span>{CONTACT_INFO.phoneDisplay}</span>
                <Link href="/terms" className="hover:text-white">Conditions d'utilisation</Link>
                <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-5.5 text-[12.5px] text-[#7d7979] sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Actu Plus. Tous droits réservés.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
