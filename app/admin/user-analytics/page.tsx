'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/atoms';
import {
  Eye,
  TrendingUp,
  Heart,
  BarChart3,
  Globe,
  Tag,
  Crown,
  Clock,
  Users,
  ArrowUpRight,
  Newspaper,
  Star,
  Activity,
} from 'lucide-react';

interface ArticleData {
  id: string;
  title: string;
  slug?: string;
  views: number;
  likes: number;
  isPremium: boolean;
  isFeatured: boolean;
  category?: { id: string; name: string };
  country?: { id: string; name: string; code: string; flag?: string };
  author?: { id: string; firstName?: string; lastName?: string; email?: string };
  publishedAt?: string;
  createdAt: string;
  articleSection?: string;
  status?: string;
}

// Fetch paginated data — backend max 100 per page
async function fetchAllArticles(): Promise<ArticleData[]> {
  const allArticles: ArticleData[] = [];
  let page = 1;
  const limit = 100;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(`/api/proxy/articles/admin?limit=${limit}&page=${page}`);
    if (!res.ok) break;
    const json = await res.json();
    // Backend response: { success, data: { data: T[], total, page, limit, totalPages } }
    const payload = json.data || json;
    const items: ArticleData[] = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];
    if (items.length === 0) break;
    allArticles.push(...items);
    totalPages = payload.totalPages || json.totalPages || 1;
    page++;
  }

  return allArticles;
}

interface KpiCard {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
  subtitle?: string;
}

export default function UserAnalyticsPage() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSubscriptions, setTotalSubscriptions] = useState({ active: 0, expired: 0, premium: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all articles with pagination (backend max 100/page)
        const [allArticles, usersRes, subsRes] = await Promise.all([
          fetchAllArticles(),
          fetch('/api/proxy/users?limit=1'),
          fetch('/api/proxy/subscriptions/stats'),
        ]);

        setArticles(allArticles);

        if (usersRes.ok) {
          const res = await usersRes.json();
          // Backend: { success, data: { data, total, ... } }
          const usersPayload = res.data || res;
          setTotalUsers(usersPayload.total || 0);
        }

        if (subsRes.ok) {
          const res = await subsRes.json();
          setTotalSubscriptions({
            active: res.active || 0,
            expired: res.expired || 0,
            premium: res.premium || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Computed analytics
  const publishedArticles = articles.filter(a => a.status === 'published' || a.publishedAt);
  const totalViews = publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgViews = publishedArticles.length > 0 ? Math.round(totalViews / publishedArticles.length) : 0;
  const premiumArticles = publishedArticles.filter(a => a.isPremium);
  const publicArticles = publishedArticles.filter(a => !a.isPremium);

  // Top articles by views
  const topByViews = [...publishedArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  // Top articles by likes (backend field: likes)
  const topByLikes = [...publishedArticles]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 10);

  // Articles by category
  const byCategory = publishedArticles.reduce((acc, a) => {
    const cat = a.category?.name || 'Sans catégorie';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryStats = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a);

  // Articles by country
  const byCountry = publishedArticles.reduce((acc, a) => {
    const key = a.country?.name || 'Non défini';
    if (!acc[key]) {
      acc[key] = { count: 0, views: 0, flag: a.country?.flag || '', code: a.country?.code || '' };
    }
    acc[key].count += 1;
    acc[key].views += a.views || 0;
    return acc;
  }, {} as Record<string, { count: number; views: number; flag: string; code: string }>);
  const countryStats = Object.entries(byCountry)
    .sort(([, a], [, b]) => b.views - a.views);

  // Views by category
  const viewsByCategory = publishedArticles.reduce((acc, a) => {
    const cat = a.category?.name || 'Sans catégorie';
    acc[cat] = (acc[cat] || 0) + (a.views || 0);
    return acc;
  }, {} as Record<string, number>);
  const viewsByCategoryStats = Object.entries(viewsByCategory)
    .sort(([, a], [, b]) => b - a);

  // Articles by section
  const bySection = publishedArticles.reduce((acc, a) => {
    const sec = a.articleSection || 'non défini';
    acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectionLabels: Record<string, string> = {
    'essentiel': "L'Essentiel",
    'toute-actualite': "Toute l'actualité",
    'focus': 'Focus',
    'chronique': 'Chronique',
    'archive': 'Archives',
    'non défini': 'Non défini',
  };

  // Recent articles (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentArticles = publishedArticles.filter(a => {
    const date = new Date(a.publishedAt || a.createdAt);
    return date >= sevenDaysAgo;
  });

  // Premium engagement
  const premiumViews = premiumArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const publicViews = publicArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgPremiumViews = premiumArticles.length > 0 ? Math.round(premiumViews / premiumArticles.length) : 0;
  const avgPublicViews = publicArticles.length > 0 ? Math.round(publicViews / publicArticles.length) : 0;

  const kpis: KpiCard[] = [
    { label: 'Total vues', value: totalViews.toLocaleString('fr-FR'), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100', subtitle: `${avgViews} vues/article en moyenne` },
    { label: 'Articles publiés', value: publishedArticles.length, icon: Newspaper, color: 'text-green-600', bg: 'bg-green-100', subtitle: `${recentArticles.length} cette semaine` },
    { label: 'Utilisateurs', value: totalUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', subtitle: `${totalSubscriptions.active} abonnés actifs` },
    { label: 'Contenu Premium', value: premiumArticles.length, icon: Crown, color: 'text-amber-600', bg: 'bg-amber-100', subtitle: `${avgPremiumViews} vues moy. vs ${avgPublicViews} public` },
  ];

  const maxViews = topByViews[0]?.views || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Suivi des utilisateurs</h1>
          <p className="mt-1 text-gray-600">Chargement des données...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Suivi des utilisateurs</h1>
        <p className="mt-1 text-gray-600">
          Comportement des utilisateurs et performance des articles
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} padding="md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
                  {kpi.subtitle && (
                    <p className="mt-1 text-xs text-gray-400">{kpi.subtitle}</p>
                  )}
                </div>
                <div className={`rounded-lg p-2.5 ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Top articles + Favorites */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top articles by views */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>Articles les plus consultés</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topByViews.length > 0 ? (
              <div className="space-y-3">
                {topByViews.map((article, index) => (
                  <div key={article.id} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/articles/${article.id}`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {article.country?.flag && (
                          <span className="text-xs">{article.country.flag}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {article.category?.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                      <Eye className="h-3.5 w-3.5" />
                      {(article.views || 0).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>

        {/* Top articles by likes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <CardTitle>Articles les plus aimés</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topByLikes.length > 0 && topByLikes.some(a => (a.likes || 0) > 0) ? (
              <div className="space-y-3">
                {topByLikes.filter(a => (a.likes || 0) > 0).map((article, index) => (
                  <div key={article.id} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-rose-100 text-rose-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/articles/${article.id}`} className="line-clamp-1 text-sm font-medium text-gray-900 hover:text-primary-600">
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {article.country?.flag && (
                          <span className="text-xs">{article.country.flag}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {article.category?.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-rose-500">
                      <Heart className="h-3.5 w-3.5" />
                      {article.likes}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Aucun article n'a encore reçu de likes</p>
                <p className="text-xs text-gray-400 mt-1">Les likes seront affichés dès que les utilisateurs interagiront</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribution: Categories + Countries */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Category */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <CardTitle>Répartition par catégorie</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {categoryStats.length > 0 ? (
              <div className="space-y-3">
                {categoryStats.map(([cat, count]) => {
                  const views = viewsByCategory[cat] || 0;
                  const percentage = Math.round((count / publishedArticles.length) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{cat}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{views.toLocaleString('fr-FR')} vues</span>
                          <span className="text-sm font-semibold text-gray-900">{count} <span className="text-xs font-normal text-gray-400">({percentage}%)</span></span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>

        {/* By Country */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              <CardTitle>Engagement par pays</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {countryStats.length > 0 ? (
              <div className="space-y-3">
                {countryStats.map(([country, data]) => {
                  const maxCountryViews = countryStats[0]?.[1]?.views || 1;
                  const percentage = Math.round((data.views / maxCountryViews) * 100);
                  return (
                    <div key={country}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {data.flag && <span className="text-lg">{data.flag}</span>}
                          <span className="text-sm font-medium text-gray-700">{country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{data.count} articles</span>
                          <span className="text-sm font-semibold text-indigo-600">{data.views.toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">vues</span></span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section distribution + Premium vs Public */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <CardTitle>Répartition par section</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(bySection).map(([section, count]) => (
                <div key={section} className="rounded-xl border border-gray-200 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sectionLabels[section] || section}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium vs Public */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              <CardTitle>Premium vs Public</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
                  <Crown className="mx-auto h-6 w-6 text-amber-500 mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{premiumArticles.length}</p>
                  <p className="text-xs text-gray-500">Articles Premium</p>
                  <p className="mt-1 text-sm font-semibold text-amber-600">{premiumViews.toLocaleString('fr-FR')} vues</p>
                  <p className="text-xs text-gray-400">{avgPremiumViews} moy./article</p>
                </div>
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-center">
                  <Newspaper className="mx-auto h-6 w-6 text-blue-500 mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{publicArticles.length}</p>
                  <p className="text-xs text-gray-500">Articles Publics</p>
                  <p className="mt-1 text-sm font-semibold text-blue-600">{publicViews.toLocaleString('fr-FR')} vues</p>
                  <p className="text-xs text-gray-400">{avgPublicViews} moy./article</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Ratio Premium / Public</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                  {publishedArticles.length > 0 && (
                    <>
                      <div
                        className="bg-amber-500 transition-all duration-500"
                        style={{ width: `${(premiumArticles.length / publishedArticles.length) * 100}%` }}
                      />
                      <div
                        className="bg-blue-500 transition-all duration-500"
                        style={{ width: `${(publicArticles.length / publishedArticles.length) * 100}%` }}
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-amber-600 font-medium">
                    {publishedArticles.length > 0 ? Math.round((premiumArticles.length / publishedArticles.length) * 100) : 0}% Premium
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    {publishedArticles.length > 0 ? Math.round((publicArticles.length / publishedArticles.length) * 100) : 0}% Public
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual bar chart for top articles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle>Top 10 — Visualisation des vues</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {topByViews.length > 0 ? (
            <div className="space-y-2.5">
              {topByViews.map((article, index) => {
                const barWidth = Math.max((article.views / maxViews) * 100, 2);
                return (
                  <div key={article.id} className="flex items-center gap-3">
                    <span className="w-6 text-right text-xs font-bold text-gray-400">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="line-clamp-1 text-sm font-medium text-gray-800">{article.title}</span>
                        {article.isPremium && (
                          <Badge variant="warning" size="sm">Premium</Badge>
                        )}
                      </div>
                      <div className="h-5 rounded-md bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-md transition-all duration-700 flex items-center justify-end pr-2 ${
                            index === 0 ? 'bg-blue-500' : index < 3 ? 'bg-blue-400' : 'bg-blue-300'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        >
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {article.views.toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
