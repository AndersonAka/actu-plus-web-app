'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState, Select } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article } from '@/types';
import { Eye, FileText } from 'lucide-react';

export default function ModerateurArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      let url = `/api/proxy/articles?page=${currentPage}&limit=10`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
        setTotalPages(data.totalPages || 1);
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

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'APPROVED', label: 'Validés' },
    { value: 'REJECTED', label: 'Rejetés' },
    { value: 'PUBLISHED', label: 'Publiés' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tous les articles</h1>
        <p className="mt-1 text-gray-600">Liste complète des articles</p>
      </div>

      <Card className="mb-6" padding="md">
        <div className="flex items-center gap-4">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-48"
          />
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
          description="Aucun article ne correspond à vos critères."
          icon={<FileText className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-gray-100">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{article.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span>Par {article.author?.firstName} {article.author?.lastName}</span>
                      <span>•</span>
                      <span>{article.category?.name}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={article.status} />
                    {article.isPremium && (
                      <span className="inline-flex items-center rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                        Premium
                      </span>
                    )}
                    <Link href={`/moderateur/articles/${article.id}`}>
                      <Button variant="ghost" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                        Voir
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
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
