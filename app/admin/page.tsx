'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/atoms';
import { useAuth } from '@/lib/hooks/useAuth';
import { FileText, Users, Tag, Globe, CreditCard, Bell, Clock, CheckCircle, XCircle, Send, Settings, Eye, BarChart3 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    articles: 0,
    users: 0,
    categories: 0,
    countries: 0,
    subscriptionsActive: 0,
    subscriptionsExpired: 0,
    articlesPending: 0,
    articlesApproved: 0,
    articlesRejected: 0,
    articlesPublished: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          articlesAdminRes,
          articlesPublishedRes,
          categoriesRes,
          countriesRes,
          usersRes,
          subscriptionsRes,
        ] = await Promise.all([
          fetch('/api/proxy/articles/admin?limit=1'),
          fetch('/api/proxy/articles?limit=1'),
          fetch('/api/proxy/categories'),
          fetch('/api/proxy/countries'),
          fetch('/api/proxy/users'),
          fetch('/api/proxy/subscriptions/stats'),
        ]);

        if (articlesAdminRes.ok) {
          const res = await articlesAdminRes.json();
          const data = res.data || res;
          setStats(prev => ({ ...prev, articles: data.total || 0 }));
        }
        if (articlesPublishedRes.ok) {
          const res = await articlesPublishedRes.json();
          const data = res.data || res;
          setStats(prev => ({ ...prev, articlesPublished: data.total || 0 }));
        }
        if (categoriesRes.ok) {
          const res = await categoriesRes.json();
          const data = res.data || res;
          setStats(prev => ({ ...prev, categories: Array.isArray(data) ? data.length : 0 }));
        }
        if (countriesRes.ok) {
          const res = await countriesRes.json();
          const data = res.data || res;
          setStats(prev => ({ ...prev, countries: Array.isArray(data) ? data.length : 0 }));
        }
        if (usersRes.ok) {
          const res = await usersRes.json();
          const data = res.data || res;
          setStats(prev => ({ ...prev, users: data.total || (Array.isArray(data) ? data.length : 0) }));
        }
        if (subscriptionsRes.ok) {
          const res = await subscriptionsRes.json();
          const data = res.data || res;
          setStats(prev => ({
            ...prev,
            subscriptionsActive: data.active || 0,
            subscriptionsExpired: data.expired || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Articles', value: stats.articles, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-100', href: '/admin/articles' },
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'text-secondary-600', bg: 'bg-secondary-100', href: '/admin/users' },
    { label: 'Catégories', value: stats.categories, icon: Tag, color: 'text-success-600', bg: 'bg-success-100', href: '/admin/categories' },
    { label: 'Pays', value: stats.countries, icon: Globe, color: 'text-warning-600', bg: 'bg-warning-100', href: '/admin/countries' },
  ];

  const subscriptionStats = [
    { label: 'Actifs', value: stats.subscriptionsActive, icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-100' },
    { label: 'Expirés', value: stats.subscriptionsExpired, icon: XCircle, color: 'text-error-600', bg: 'bg-error-100' },
  ];

  const articleStatusStats = [
    { label: 'En attente', value: stats.articlesPending, icon: Clock, color: 'text-warning-600', bg: 'bg-warning-100', unavailable: true },
    { label: 'Validés', value: stats.articlesApproved, icon: CheckCircle, color: 'text-primary-600', bg: 'bg-primary-100', unavailable: true },
    { label: 'Rejetés', value: stats.articlesRejected, icon: XCircle, color: 'text-error-600', bg: 'bg-error-100', unavailable: true },
    { label: 'Publiés', value: stats.articlesPublished, icon: Send, color: 'text-success-600', bg: 'bg-success-100' },
  ];

  const quickLinks = [
    { label: 'Gérer les articles', href: '/admin/articles', icon: FileText },
    { label: 'Gérer les utilisateurs', href: '/admin/users', icon: Users },
    { label: 'Suivi utilisateurs', href: '/admin/user-analytics', icon: Eye },
    { label: 'Suivi veilleurs', href: '/admin/veilleur-analytics', icon: BarChart3 },
    { label: 'Gérer les catégories', href: '/admin/categories', icon: Tag },
    { label: 'Gérer les pays', href: '/admin/countries', icon: Globe },
    { label: 'Abonnements', href: '/admin/subscriptions', icon: CreditCard },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="mt-1 text-gray-600">
          Bienvenue, {user?.firstName || 'Admin'}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card padding="md" hover>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {isLoading ? '...' : stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Abonnements</CardTitle>
              <Link href="/admin/subscriptions">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {subscriptionStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <div className={`rounded-lg p-2 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? '...' : stat.value}
                      </p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Statut des articles</CardTitle>
              <Link href="/admin/articles">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {articleStatusStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-3 rounded-lg border border-gray-100 p-4">
                    <div className={`rounded-lg p-2 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {isLoading ? '...' : (stat as any).unavailable ? '0' : stat.value}
                      </p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accès rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-primary-200 hover:bg-primary-50"
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
