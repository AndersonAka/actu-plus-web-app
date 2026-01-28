'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header, Footer } from '@/components/organisms';
import { SearchBar, ArticleCard } from '@/components/molecules';
import { Button, Badge } from '@/components/atoms';
import { Article, Category, Country } from '@/types';
import { 
  Search, 
  Filter, 
  X, 
  Newspaper, 
  Globe2, 
  Tag, 
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchFilters {
  category: string;
  country: string;
  dateRange: string;
  sortBy: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const countryParam = searchParams.get('country') || '';
  const sortParam = searchParams.get('sort') || 'relevance';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: categoryParam,
    country: countryParam,
    dateRange: '',
    sortBy: sortParam,
  });

  // Fetch categories and countries for filters
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [catRes, countryRes] = await Promise.all([
          fetch('/api/proxy/categories'),
          fetch('/api/proxy/countries'),
        ]);

        if (catRes.ok) {
          const data = await catRes.json();
          setCategories(Array.isArray(data) ? data : data.data || []);
        }

        if (countryRes.ok) {
          const data = await countryRes.json();
          setCountries(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFiltersData();
  }, []);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setArticles([]);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('search', query);
        params.set('status', 'PUBLISHED');
        params.set('page', String(pageParam));
        params.set('limit', '12');
        
        if (filters.category) params.set('categoryId', filters.category);
        if (filters.country) params.set('countryId', filters.country);
        if (filters.sortBy === 'date') params.set('sortBy', 'publishedAt');
        if (filters.sortBy === 'views') params.set('sortBy', 'views');

        const response = await fetch(`/api/proxy/articles?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          const articlesList = data.data?.data || data.articles || data.data || [];
          setArticles(articlesList);
          setTotalResults(data.data?.total || data.total || articlesList.length);
          setTotalPages(data.data?.totalPages || data.totalPages || 1);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, pageParam, filters]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.country) params.set('country', filters.country);
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
    router.push(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.country) params.set('country', newFilters.country);
    if (newFilters.sortBy !== 'relevance') params.set('sort', newFilters.sortBy);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ category: '', country: '', dateRange: '', sortBy: 'relevance' });
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const hasActiveFilters = filters.category || filters.country || filters.sortBy !== 'relevance';

  return (
    <main className="flex-1 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recherche</h1>
              <p className="text-sm text-gray-500">Explorez notre base d'articles</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <SearchBar
              placeholder="Rechercher des articles, pays, catégories..."
              defaultValue={query}
              onSearch={handleSearch}
              className="flex-1"
              size="lg"
              autoFocus
            />
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filtres</span>
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  !
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres avancés
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Réinitialiser
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Category Filter */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-gray-400" />
                  Pays
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="date">Plus récents</option>
                  <option value="views">Plus vus</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query ? (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recherche en cours...
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">{totalResults}</span> résultat
                    {totalResults > 1 ? 's' : ''} pour{' '}
                    <span className="font-semibold text-primary-600">"{query}"</span>
                  </>
                )}
              </p>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
                    <div className="mb-4 h-40 rounded-lg bg-gray-200" />
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', String(page));
                          router.push(`/search?${params.toString()}`);
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          page === pageParam
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-500 mb-4">
                  Essayez avec d'autres mots-clés ou modifiez vos filtres
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Empty State - No Query */
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <Newspaper className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Que recherchez-vous ?
            </h2>
            <p className="mb-6 text-gray-500 max-w-md mx-auto">
              Tapez votre recherche ci-dessus pour explorer nos articles d'actualité
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.id}`}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense
        fallback={
          <main className="flex-1 bg-gray-50 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            </div>
          </main>
        }
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
