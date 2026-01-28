'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header, Footer, ArticleList } from '@/components/organisms';
import { SearchBar } from '@/components/molecules';
import { Select } from '@/components/atoms';
import { Article, Category, ArticleListResponse } from '@/types';

function ArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const currentPage = Number(searchParams.get('page')) || 1;
  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('status', 'PUBLISHED');
        params.set('page', String(currentPage));
        params.set('limit', '9');
        if (categoryFilter) params.set('category', categoryFilter);
        if (searchQuery) params.set('search', searchQuery);

        const [articlesRes, categoriesRes] = await Promise.all([
          fetch(`/api/proxy/articles?${params.toString()}`),
          fetch('/api/proxy/categories'),
        ]);

        if (articlesRes.ok) {
          const data = await articlesRes.json();
          // Handle different response structures from backend
          const articlesList = data.data?.data || data.data || data.articles || [];
          setArticles(articlesList);
          setTotalPages(data.data?.totalPages || data.totalPages || 1);
        }

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json();
          setCategories(Array.isArray(cats) ? cats : cats.data || []);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, categoryFilter, searchQuery]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/articles?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/articles?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    params.delete('page');
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="mt-2 text-gray-600">Découvrez toutes nos actualités</p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              placeholder="Rechercher un article..."
              defaultValue={searchQuery}
              onSearch={handleSearch}
              className="w-full sm:w-80"
            />
            <Select
              options={[
                { value: '', label: 'Toutes les catégories' },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>

          <ArticleList
            articles={articles}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            emptyMessage={
              searchQuery
                ? `Aucun article trouvé pour "${searchQuery}"`
                : 'Aucun article disponible'
            }
          />
        </div>
      </main>
  );
}

export default function ArticlesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          </div>
        </main>
      }>
        <ArticlesContent />
      </Suspense>
      <Footer />
    </div>
  );
}
