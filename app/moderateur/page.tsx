'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { Article } from '@/types';
import { Clock, CheckCircle, XCircle, Send, Eye } from 'lucide-react';

export default function ModerateurDashboardPage() {
  const { user } = useAuth();
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pendingRes, approvedRes, rejectedRes, publishedRes] = await Promise.all([
          fetch('/api/proxy/articles?status=pending&limit=10'),
          fetch('/api/proxy/articles?status=approved&limit=1'),
          fetch('/api/proxy/articles?status=rejected&limit=1'),
          fetch('/api/proxy/articles?status=published&limit=1'),
        ]);

        // Helper pour extraire les données de la réponse API
        const parseResponse = (result: any) => {
          if (result.data?.data && Array.isArray(result.data.data)) {
            return { articles: result.data.data, total: result.data.meta?.total || result.data.data.length };
          } else if (result.data && Array.isArray(result.data)) {
            return { articles: result.data, total: result.data.length };
          } else if (Array.isArray(result)) {
            return { articles: result, total: result.length };
          }
          return { articles: [], total: 0 };
        };

        if (pendingRes.ok) {
          const data = await pendingRes.json();
          const parsed = parseResponse(data);
          setPendingArticles(parsed.articles);
          setStats(prev => ({ ...prev, pending: parsed.total }));
        }
        if (approvedRes.ok) {
          const data = await approvedRes.json();
          const parsed = parseResponse(data);
          setStats(prev => ({ ...prev, approved: parsed.total }));
        }
        if (rejectedRes.ok) {
          const data = await rejectedRes.json();
          const parsed = parseResponse(data);
          setStats(prev => ({ ...prev, rejected: parsed.total }));
        }
        if (publishedRes.ok) {
          const data = await publishedRes.json();
          const parsed = parseResponse(data);
          setStats(prev => ({ ...prev, published: parsed.total }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-warning-600', bg: 'bg-warning-100', href: '/moderateur/pending' },
    { label: 'Validés', value: stats.approved, icon: CheckCircle, color: 'text-primary-600', bg: 'bg-primary-100', href: '/moderateur/approved' },
    { label: 'Rejetés', value: stats.rejected, icon: XCircle, color: 'text-error-600', bg: 'bg-error-100', href: '/moderateur/rejected' },
    { label: 'Publiés', value: stats.published, icon: Send, color: 'text-success-600', bg: 'bg-success-100', href: '/moderateur/published' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.firstName || 'Modérateur'}
        </h1>
        <p className="mt-1 text-gray-600">
          Validez et publiez les articles soumis
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card padding="md" hover={!!stat.href}>
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
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>{content}</Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Articles en attente</CardTitle>
            <Link href="/moderateur/pending">
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
          ) : pendingArticles.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-success-300" />
              <p className="mt-2 text-gray-500">Aucun article en attente</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingArticles.slice(0, 5).map((article) => (
                <div key={article.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{article.title}</p>
                    <p className="text-sm text-gray-500">
                      Par {article.author.firstName} {article.author.lastName} • {article.category.name}
                    </p>
                  </div>
                  <Link href={`/moderateur/articles/${article.id}`}>
                    <Button variant="primary" size="sm" leftIcon={<Eye className="h-4 w-4" />}>
                      Examiner
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
