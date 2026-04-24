'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article } from '@/types';
import { Eye, Clock, Archive } from 'lucide-react';

export default function ModerateurPendingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/proxy/articles?status=pending&page=${currentPage}&limit=10`
        );
        if (response.ok) {
          const result = await response.json();
          // Parser la réponse API (formats backend/proxy possibles)
          const payload = result?.data ?? result;
          const articlesList: Article[] = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.articles)
              ? payload.articles
              : Array.isArray(payload)
                ? payload
                : [];

          const total =
            typeof payload?.total === 'number'
              ? payload.total
              : typeof payload?.meta?.total === 'number'
                ? payload.meta.total
                : articlesList.length;

          const computedTotalPages =
            typeof payload?.totalPages === 'number'
              ? payload.totalPages
              : Math.ceil(total / 10) || 1;

          setArticles(articlesList);
          setTotalPages(computedTotalPages);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const handleArchive = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver cet article ?')) return;
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/archive`, { method: 'POST' });
      if (response.ok) {
        fetchArticles();
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors de l\'archivage');
      }
    } catch (error) {
      console.error('Archive error:', error);
      alert('Erreur lors de l\'archivage');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Articles en attente</h1>
        <p className="mt-1 text-gray-600">Articles soumis en attente de validation</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="Aucun article en attente"
          description="Tous les articles ont été traités."
          icon={<Clock className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <>
          {totalPages > 1 && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

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
                      <span>Par {article.author.firstName} {article.author.lastName}</span>
                      <span>•</span>
                      <span>{article.category.name}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={article.status} />
                    <Link href={`/moderateur/articles/${article.id}`}>
                      <Button variant="primary" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                        Examiner
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(article.id)}
                      title="Archiver"
                      className="text-gray-500 hover:text-warning-600"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
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
