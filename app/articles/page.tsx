'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicShell } from '../PublicShell';
import { ArticleList } from '@/components/organisms';
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
  const sectionFilter = searchParams.get('section') || '';
  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const contentTypeFilter = searchParams.get('contentType') || '';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('status', 'published');
        params.set('page', String(currentPage));
        params.set('limit', '9');
        if (categoryFilter) params.set('categoryId', categoryFilter);
        if (sectionFilter) params.set('articleSection', sectionFilter);
        if (searchQuery) params.set('search', searchQuery);
        // Exclude summary articles by default; allow explicit contentType filter
        if (contentTypeFilter) {
          params.set('contentType', contentTypeFilter);
        } else {
          params.set('contentType', 'article');
        }
        // Load only articles published today
        params.set('publishedToday', 'true');

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
  }, [currentPage, categoryFilter, sectionFilter, searchQuery]);

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
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.delete('q'); // Clean up old param if exists
    params.delete('page');
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="py-8">
        <div className="mx-auto max-w-360 px-5 sm:px-9">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#201e1d]">Articles</h1>
            <p className="mt-2 text-[#605d5d]">Découvrez toutes nos actualités</p>
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
              className="w-full rounded-none border-[#d7d3d3] focus:border-[#ec3013] focus:ring-[#ec3013]/20 sm:w-48"
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
      </div>
  );
}

export default function ArticlesPage() {
  return (
    <PublicShell>
      <Suspense fallback={
        <div className="py-8">
          <div className="mx-auto max-w-360 px-5 sm:px-9">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[#201e1d]">Articles</h1>
              <p className="mt-2 text-[#605d5d]">Chargement...</p>
            </div>
          </div>
        </div>
      }>
        <ArticlesContent />
      </Suspense>
    </PublicShell>
  );
}
