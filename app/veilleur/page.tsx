'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/atoms';
import { StatusBadge } from '@/components/molecules';
import { useAuth } from '@/lib/hooks/useAuth';
import { Article, ArticleStatus } from '@/types';
import { FileText, Plus, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

// Fonction pour dériver le statut de l'article
const getArticleStatus = (article: any): ArticleStatus => {
  if (article.status) return article.status;
  if (article.isPublished) return ArticleStatus.PUBLISHED;
  return ArticleStatus.DRAFT;
};

export default function VeilleurDashboardPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
  });

  useEffect(() => {
    const fetchMyArticles = async () => {
      try {
        const response = await fetch('/api/proxy/articles/my');
        if (response.ok) {
          const result = await response.json();
          // Le backend enveloppe la réponse: { success, data: { data: articles[], meta }, timestamp }
          let articlesList: Article[] = [];
          if (result.data?.data && Array.isArray(result.data.data)) {
            articlesList = result.data.data;
          } else if (result.data && Array.isArray(result.data)) {
            articlesList = result.data;
          } else if (Array.isArray(result)) {
            articlesList = result;
          }
          
          setArticles(articlesList);
          
          const newStats = {
            total: articlesList.length,
            draft: articlesList.filter((a: any) => getArticleStatus(a) === ArticleStatus.DRAFT).length,
            pending: articlesList.filter((a: any) => getArticleStatus(a) === ArticleStatus.PENDING).length,
            approved: articlesList.filter((a: any) => getArticleStatus(a) === ArticleStatus.APPROVED).length,
            rejected: articlesList.filter((a: any) => getArticleStatus(a) === ArticleStatus.REJECTED).length,
            published: articlesList.filter((a: any) => getArticleStatus(a) === ArticleStatus.PUBLISHED).length,
          };
          setStats(newStats);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyArticles();
  }, []);

  const statCards = [
    { label: 'Total', value: stats.total, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'Brouillons', value: stats.draft, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-warning-600', bg: 'bg-warning-100' },
    { label: 'Validés', value: stats.approved, icon: CheckCircle, color: 'text-primary-600', bg: 'bg-primary-100' },
    { label: 'Rejetés', value: stats.rejected, icon: XCircle, color: 'text-error-600', bg: 'bg-error-100' },
    { label: 'Publiés', value: stats.published, icon: Send, color: 'text-success-600', bg: 'bg-success-100' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.firstName || 'Veilleur'}
          </h1>
          <p className="mt-1 text-gray-600">
            Gérez vos articles et suivez leur statut
          </p>
        </div>
        <Link href="/veilleur/articles/create">
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            Nouvel article
          </Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} padding="md">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mes articles récents</CardTitle>
            <Link href="/veilleur/articles">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">Aucun article pour le moment</p>
              <Link href="/veilleur/articles/create">
                <Button variant="primary" size="sm" className="mt-4">
                  Créer mon premier article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {articles.slice(0, 5).map((article) => {
                const status = getArticleStatus(article);
                const canEdit = status === ArticleStatus.DRAFT;
                const viewUrl = canEdit 
                  ? `/veilleur/articles/${article.id}/edit` 
                  : `/veilleur/articles/${article.id}`;
                
                return (
                  <div key={article.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={viewUrl}
                        className="font-medium text-gray-900 hover:text-primary-600"
                      >
                        {article.title}
                      </Link>
                      <p className="text-sm text-gray-500">{article.category?.name || 'Sans catégorie'}</p>
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
