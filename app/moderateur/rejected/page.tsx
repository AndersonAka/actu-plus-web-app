'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article } from '@/types';
import { Eye, XCircle } from 'lucide-react';

export default function ModerateurRejectedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/proxy/articles?status=rejected&page=${currentPage}&limit=10`
        );
        if (response.ok) {
          const result = await response.json();
          // Parser la réponse API
          let articlesList: Article[] = [];
          let total = 0;
          if (result.data?.data && Array.isArray(result.data.data)) {
            articlesList = result.data.data;
            total = result.data.meta?.total || articlesList.length;
          } else if (result.data && Array.isArray(result.data)) {
            articlesList = result.data;
            total = articlesList.length;
          } else if (Array.isArray(result)) {
            articlesList = result;
            total = articlesList.length;
          }
          setArticles(articlesList);
          setTotalPages(Math.ceil(total / 10) || 1);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Articles rejetés</h1>
        <p className="mt-1 text-gray-600">Articles qui ont été rejetés</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="Aucun article rejeté"
          description="Les articles rejetés apparaîtront ici."
          icon={<XCircle className="h-12 w-12 text-gray-400" />}
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
                    </div>
                    {article.rejectionReason && (
                      <p className="mt-2 text-sm text-error-600 bg-error-50 rounded px-2 py-1 inline-block">
                        Raison: {article.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={article.status} />
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
