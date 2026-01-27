'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { Plus, Filter } from 'lucide-react';

const getArticleStatus = (article: Article): ArticleStatus => {
  if (article.status) return article.status;
  if (article.isPublished) return ArticleStatus.PUBLISHED;
  return ArticleStatus.DRAFT;
};

export default function VeilleurArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', '10');
        if (statusFilter) params.set('status', statusFilter);

        const response = await fetch(`/api/proxy/articles/my?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          // Le backend enveloppe la réponse dans { success, data, timestamp }
          // data contient { data: articles[], meta: { page, limit, total, totalPages } }
          const responseData = result.data || result;
          const articlesData = responseData.data || responseData.articles || responseData;
          setArticles(Array.isArray(articlesData) ? articlesData : []);
          setTotalPages(responseData.meta?.totalPages || responseData.totalPages || 1);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, statusFilter]);

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: ArticleStatus.DRAFT, label: 'Brouillons' },
    { value: ArticleStatus.PENDING, label: 'En attente' },
    { value: ArticleStatus.APPROVED, label: 'Validés' },
    { value: ArticleStatus.REJECTED, label: 'Rejetés' },
    { value: ArticleStatus.PUBLISHED, label: 'Publiés' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes articles</h1>
          <p className="mt-1 text-gray-600">Gérez tous vos articles</p>
        </div>
        <Link href="/veilleur/articles/create">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Nouvel article
          </Button>
        </Link>
      </div>

      <Card className="mb-6" padding="md">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="Aucun article"
          description="Vous n'avez pas encore créé d'article."
          action={{
            label: 'Créer un article',
            onClick: () => window.location.href = '/veilleur/articles/create',
          }}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-gray-100">
              {articles.map((article) => {
                const status = getArticleStatus(article);
                const canEdit = status === ArticleStatus.DRAFT;
                
                return (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      {canEdit ? (
                        <Link
                          href={`/veilleur/articles/${article.id}/edit`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {article.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">{article.title}</span>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                        <span>{article.category?.name || 'Sans catégorie'}</span>
                        <span>•</span>
                        <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      {canEdit ? (
                        <Link href={`/veilleur/articles/${article.id}/edit`}>
                          <Button variant="ghost" size="sm">Modifier</Button>
                        </Link>
                      ) : (
                        <Link href={`/veilleur/articles/${article.id}`}>
                          <Button variant="ghost" size="sm">Voir</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
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
