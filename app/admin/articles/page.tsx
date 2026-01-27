'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState, Input, Select } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { Eye, Search, FileText, Trash2 } from 'lucide-react';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      let url = `/api/proxy/articles/admin?page=${currentPage}&limit=10`;
      if (statusFilter) {
        const isPublished = statusFilter === 'PUBLISHED';
        url += `&isPublished=${isPublished}`;
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

      <Card className="mb-6" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="sm:w-48"
          />
          <Button type="submit" variant="primary">Rechercher</Button>
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
                    <th className="px-4 py-3">Premium</th>
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
                            Premium
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
                          <Link href={`/articles/${article.id}`}>
                            <Button variant="ghost" size="sm">
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
