'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicShell } from '../PublicShell';
import { Pagination } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { Country, Sector } from '@/types';
import { Radar, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAGE_SIZE = 12;

interface VeilleSectorielleEntry {
  articleId: string;
  articleSlug: string;
  sector?: string;
  title: string;
  summary: string;
  link?: string;
  isPremium?: boolean;
  publishedAt: string | null;
  country: { id: string; code: string; name: string; flag?: string } | null;
}

const SECTOR_LABELS: Record<string, string> = {
  'banque-assurance': 'Banque & Assurance',
  energie: 'Énergie',
  'agro-industrielle': 'Agro Industrielle',
};

function getTextPreview(html: string, maxLength: number = 160): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

const sectorFilters: { label: string; value: Sector | 'all' }[] = [
  { label: 'Tous secteurs', value: 'all' },
  { label: 'Banque et assurance', value: 'banque-assurance' },
  { label: 'Énergie', value: 'energie' },
  { label: 'Agro Industrielle', value: 'agro-industrielle' },
];

const VALID_SECTORS: Sector[] = ['banque-assurance', 'energie', 'agro-industrielle'];

export default function VeilleSectoriellePage() {
  return (
    <Suspense fallback={null}>
      <VeilleSectoriellePageInner />
    </Suspense>
  );
}

function VeilleSectoriellePageInner() {
  const searchParams = useSearchParams();
  const initialSector = searchParams.get('sector');
  const initialCountryId = searchParams.get('countryId');

  const [entries, setEntries] = useState<VeilleSectorielleEntry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sectorFilter, setSectorFilter] = useState<Sector | 'all'>(
    initialSector && (VALID_SECTORS as string[]).includes(initialSector) ? (initialSector as Sector) : 'all',
  );
  const [countryFilter, setCountryFilter] = useState<string>(initialCountryId || 'all');

  useEffect(() => {
    fetch('/api/proxy/countries')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        const ctrs = json.data || json;
        setCountries(Array.isArray(ctrs) ? ctrs : []);
      })
      .catch(() => {});
  }, []);

  const loadEntries = useCallback(
    async (page: number, sector: Sector | 'all', countryId: string) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });
        if (sector !== 'all') params.set('sector', sector);
        if (countryId !== 'all') params.set('countryId', countryId);

        const response = await fetch(`/api/proxy/articles/veille-sectorielle/entries?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la Veille Sectorielle');
        }

        const result = await response.json();
        const payload = result.data?.data ? result.data : result;
        const rawEntries = payload.data || [];

        setEntries(Array.isArray(rawEntries) ? rawEntries : []);
        setTotalCount(payload.total || 0);
        setTotalPages(Math.max(1, payload.totalPages || Math.ceil((payload.total || 0) / PAGE_SIZE)));
        setCurrentPage(page);
      } catch (err) {
        console.error('Erreur lors du chargement de la Veille Sectorielle:', err);
        setError('Impossible de charger la Veille Sectorielle');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadEntries(1, sectorFilter, countryFilter);
  }, [sectorFilter, countryFilter, loadEntries]);

  const handlePageChange = (page: number) => {
    loadEntries(page, sectorFilter, countryFilter);
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
                <Radar className="h-6 w-6 text-[#ae1800]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#201e1d]">Veille Sectorielle</h1>
                <p className="text-sm text-[#605d5d]">
                  {totalCount > 0
                    ? `${totalCount} entrée${totalCount !== 1 ? 's' : ''}`
                    : 'Banque et assurance, Énergie, Agro Industrielle'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap border border-[#201e1d]">
            {sectorFilters.map((filter, i) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSectorFilter(filter.value)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${i > 0 ? 'border-l border-[#201e1d]' : ''} ${
                  sectorFilter === filter.value
                    ? 'bg-[#201e1d] text-white'
                    : 'text-[#201e1d] hover:bg-[#eae9e9]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {countries.length > 0 && (
            <div className="mb-6 mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCountryFilter('all')}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  countryFilter === 'all'
                    ? 'bg-[#ec3013] text-white'
                    : 'bg-[#eae9e9] text-[#605d5d] hover:bg-[#e0dede]'
                }`}
              >
                Tous pays
              </button>
              {countries.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCountryFilter(c.id)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    countryFilter === c.id
                      ? 'bg-[#ec3013] text-white'
                      : 'bg-[#eae9e9] text-[#605d5d] hover:bg-[#e0dede]'
                  }`}
                >
                  {c.flag ? `${c.flag} ` : ''}{c.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#ec3013]" />
            </div>
          ) : error ? (
            <div className="border border-[#ffc4b8] bg-[#fff2ef] p-8 text-center">
              <p className="text-[#ae1800]">{error}</p>
              <Button
                variant="modernist-outline"
                size="sm"
                className="mt-4"
                onClick={() => loadEntries(currentPage, sectorFilter, countryFilter)}
              >
                Réessayer
              </Button>
            </div>
          ) : entries.length === 0 ? (
            <div className="border border-[#d7d3d3] bg-[#f8f4f4] p-12 text-center">
              <Radar className="mx-auto h-12 w-12 text-[#d7d3d3]" />
              <h3 className="mt-4 text-lg font-bold text-[#201e1d]">Aucune entrée</h3>
              <p className="mt-2 text-sm text-[#605d5d]">Aucune entrée de Veille Sectorielle pour ce filtre.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry, index) => (
                  <Link
                    key={`${entry.articleId}-${index}`}
                    href={entry.country?.code ? `/country/${entry.country.code.toLowerCase()}?tab=veille-sectorielle` : `/articles/${entry.articleSlug}`}
                    className="group flex flex-col border border-[#d7d3d3] p-5 transition-colors hover:border-[#201e1d]/40 hover:bg-[#f8f4f4]"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.sector && (
                          <span className="bg-[#ffe0d9] px-2.5 py-0.5 text-xs font-semibold text-[#ae1800]">
                            {SECTOR_LABELS[entry.sector] || entry.sector}
                          </span>
                        )}
                        {entry.country && (
                          <span className="text-xs text-[#9b9797]">
                            {entry.country.flag && <span className="mr-1">{entry.country.flag}</span>}
                            {entry.country.name}
                          </span>
                        )}
                      </div>
                      {entry.isPremium && (
                        <span className="bg-[#ec3013] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">Pro</span>
                      )}
                    </div>
                    <h3 className="mb-2 line-clamp-2 font-bold text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
                      {entry.title}
                    </h3>
                    <p className="mb-3 line-clamp-3 flex-1 text-sm text-[#605d5d]">
                      {getTextPreview(entry.summary, 160)}
                    </p>
                    {entry.publishedAt && (
                      <span className="flex items-center gap-1 text-xs text-[#9b9797]">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(entry.publishedAt), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    )}
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
