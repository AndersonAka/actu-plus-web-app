'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState, Input, Select } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { Eye, Search, FileText, Trash2, BarChart3, Clock, CheckCircle, Crown, XCircle } from 'lucide-react';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, rejected: 0, premium: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);

  const fetchGlobalStats = async () => {
    try {
      // Fetch all articles page by page (backend max limit is 100)
      let allArticles: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let globalTotal = 0;

      // Fetch first page to get total count
      const firstResponse = await fetch(`/api/proxy/articles/admin?page=1&limit=100`);
      if (!firstResponse.ok) {
        console.error('Error fetching stats - first page failed');
        return;
      }

      const firstRes = await firstResponse.json();
      const firstPayload = firstRes?.data ?? firstRes;
      globalTotal = typeof firstPayload?.total === 'number' ? firstPayload.total : 0;
      totalPages = typeof firstPayload?.totalPages === 'number' ? firstPayload.totalPages : 1;
      
      const firstArticles: any[] =
        Array.isArray(firstPayload)
          ? firstPayload
          : Array.isArray(firstPayload?.data)
            ? firstPayload.data
            : Array.isArray(firstPayload?.articles)
              ? firstPayload.articles
              : [];
      
      allArticles = [...firstArticles];

      // Fetch remaining pages (limit to 10 pages max for performance - 1000 articles)
      const maxPages = Math.min(totalPages, 10);
      for (let page = 2; page <= maxPages; page++) {
        const response = await fetch(`/api/proxy/articles/admin?page=${page}&limit=100`);
        if (response.ok) {
          const res = await response.json();
          const payload = res?.data ?? res;
          const articles: any[] =
            Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.data)
                ? payload.data
                : Array.isArray(payload?.articles)
                  ? payload.articles
                  : [];
          allArticles = [...allArticles, ...articles];
        }
      }

      // Calculate stats from fetched articles
      const published = allArticles.filter((a: any) => a.isPublished || a.status === 'published').length;
      const pending = allArticles.filter((a: any) => a.status === 'pending').length;
      const rejected = allArticles.filter((a: any) => a.status === 'rejected').length;
      const premium = allArticles.filter((a: any) => a.isPremium).length;
      
      setStats({ total: globalTotal, published, pending, rejected, premium });
      setStatsLoaded(true);
    } catch (error) {
      console.error('Error fetching global stats:', error);
    }
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      let url = `/api/proxy/articles/admin?page=${currentPage}&limit=10`;
      if (statusFilter) {
        // Map status filter to backend parameters
        if (statusFilter === 'PUBLISHED') {
          url += `&isPublished=true`;
        } else if (statusFilter === 'DRAFT' || statusFilter === 'PENDING' || statusFilter === 'APPROVED' || statusFilter === 'REJECTED') {
          url += `&status=${statusFilter.toLowerCase()}`;
        }
      }
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await fetch(url);
      if (response.ok) {
        const res = await response.json();
        const payload = res?.data ?? res;

        const nextArticles =
          Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.articles)
                ? payload.articles
                : [];

        setArticles(nextArticles);

        const nextTotalPages =
          typeof payload?.totalPages === 'number'
            ? payload.totalPages
            : 1;
        setTotalPages(nextTotalPages);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'APPROVED', label: 'Validé' },
    { value: 'REJECTED', label: 'Rejeté' },
    { value: 'PUBLISHED', label: 'Publié' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des articles</h1>
        <p className="mt-1 text-gray-600">Gérez tous les articles de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
            <FileText className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            {statsLoaded ? (
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            ) : (
              <div className="h-7 w-10 animate-pulse rounded bg-gray-200" />
            )}
            <p className="text-xs text-gray-500">Total articles</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-100">
            <CheckCircle className="h-5 w-5 text-success-600" />
          </div>
          <div>
            {statsLoaded ? (
              <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
            ) : (
              <div className="h-7 w-10 animate-pulse rounded bg-gray-200" />
            )}
            <p className="text-xs text-gray-500">Publiés</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
            <Clock className="h-5 w-5 text-warning-600" />
          </div>
          <div>
            {statsLoaded ? (
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            ) : (
              <div className="h-7 w-10 animate-pulse rounded bg-gray-200" />
            )}
            <p className="text-xs text-gray-500">En attente</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100">
            <XCircle className="h-5 w-5 text-error-600" />
          </div>
          <div>
            {statsLoaded ? (
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            ) : (
              <div className="h-7 w-10 animate-pulse rounded bg-gray-200" />
            )}
            <p className="text-xs text-gray-500">Rejetés</p>
          </div>
        </Card>
        <Card padding="md" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            {statsLoaded ? (
              <p className="text-2xl font-bold text-gray-900">{stats.premium}</p>
            ) : (
              <div className="h-7 w-10 animate-pulse rounded bg-gray-200" />
            )}
            <p className="text-xs text-gray-500">Contenu abonné</p>
          </div>
        </Card>
      </div>

      <Card className="mb-6" padding="lg">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recherche et filtres</h3>
          <p className="text-xs text-gray-500 mt-1">Recherchez et filtrez les articles par statut</p>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <Input
              placeholder="Rechercher par titre, extrait ou contenu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="w-full"
            />
          </div>
          <div className="sm:w-56">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
          <Button type="submit" variant="primary" className="sm:w-auto w-full">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="Aucun article trouvé"
          description="Modifiez vos filtres ou créez un nouvel article."
          icon={<FileText className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Titre</th>
                    <th className="px-4 py-3">Auteur</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Contenu abonné</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {article.author?.firstName} {article.author?.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {article.category?.name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={(article.status || (article.isPublished ? 'PUBLISHED' : 'DRAFT')) as ArticleStatus} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        {article.isPremium ? (
                          <span className="inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                            Contenu abonné
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Public</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button variant="ghost" size="sm" title="Voir l'article">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
