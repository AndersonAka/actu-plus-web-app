'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Avatar } from '@/components/atoms';
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  Trophy,
  BarChart3,
  Eye,
  Medal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

interface VeilleurStats {
  id: string;
  name: string;
  email?: string;
  total: number;
  published: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  totalViews: number;
  avgViews: number;
  publicationRate: number;
  acceptanceRate: number;
  lastArticleDate: string | null;
  isActiveLast30Days: boolean;
}

interface GlobalStats {
  totalArticles: number;
  published: number;
  pending: number;
  rejected: number;
  approved: number;
  totalVeilleurs: number;
  avgArticlesPerVeilleur: number;
  activeVeilleurs: number;
}

async function fetchVeilleurStats(): Promise<{ veilleurs: VeilleurStats[]; global: GlobalStats }> {
  const res = await fetch('/api/proxy/articles/veilleur-stats');
  if (!res.ok) throw new Error('Erreur lors du chargement des statistiques');
  const json = await res.json();
  return json.data || json;
}

export default function VeilleurAnalyticsPage() {
  const [veilleurStats, setVeilleurStats] = useState<VeilleurStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'total' | 'published' | 'views' | 'rate'>('total');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { veilleurs, global } = await fetchVeilleurStats();
        setVeilleurStats(veilleurs);
        setGlobalStats(global);
      } catch (error) {
        console.error('Error fetching veilleur stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorted veilleurs
  const sortedVeilleurs = useMemo(() => {
    return [...veilleurStats].sort((a, b) => {
      switch (sortBy) {
        case 'total': return b.total - a.total;
        case 'published': return b.published - a.published;
        case 'views': return b.totalViews - a.totalViews;
        case 'rate': return b.publicationRate - a.publicationRate;
        default: return b.total - a.total;
      }
    });
  }, [veilleurStats, sortBy]);

  // Top 3 veilleurs
  const topVeilleurs = sortedVeilleurs.slice(0, 3);
  const medalColors = ['text-amber-500', 'text-gray-400', 'text-orange-400'];
  const medalBgs = ['bg-amber-50 border-amber-200', 'bg-gray-50 border-gray-200', 'bg-orange-50 border-orange-200'];

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading || !globalStats) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Suivi des veilleurs</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">Suivi des veilleurs</h1>
        <p className="mt-1 text-gray-600">
          Performance et activité des veilleurs — indicateurs et classement
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Veilleurs actifs</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{globalStats.totalVeilleurs}</p>
              <p className="mt-1 text-xs text-gray-400">{globalStats.activeVeilleurs} actifs ces 30 derniers jours</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-2.5">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total articles</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{globalStats.totalArticles}</p>
              <p className="mt-1 text-xs text-gray-400">{globalStats.avgArticlesPerVeilleur} en moy. par veilleur</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-2.5">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Publiés</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{globalStats.published}</p>
              <p className="mt-1 text-xs text-gray-400">
                {globalStats.totalArticles > 0 ? Math.round((globalStats.published / globalStats.totalArticles) * 100) : 0}% du total
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-2.5">
              <Send className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{globalStats.pending}</p>
              <p className="mt-1 text-xs text-gray-400">{globalStats.rejected} rejetés • {globalStats.approved} validés</p>
            </div>
            <div className="rounded-lg bg-amber-100 p-2.5">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Podium - Top 3 */}
      {topVeilleurs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Podium des veilleurs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {topVeilleurs.map((veilleur, index) => (
                <div
                  key={veilleur.id}
                  className={`relative rounded-xl border-2 p-5 text-center ${medalBgs[index]}`}
                >
                  <Medal className={`mx-auto h-8 w-8 ${medalColors[index]} mb-2`} />
                  <div className="absolute top-3 right-3 text-xs font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <Avatar
                    name={veilleur.name}
                    size="lg"
                    className="mx-auto mb-2"
                  />
                  <h3 className="font-bold text-gray-900">{veilleur.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{veilleur.email}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-lg font-bold text-gray-900">{veilleur.total}</p>
                      <p className="text-[10px] text-gray-500">Articles</p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-lg font-bold text-green-600">{veilleur.published}</p>
                      <p className="text-[10px] text-gray-500">Publiés</p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-lg font-bold text-blue-600">{veilleur.publicationRate}%</p>
                      <p className="text-[10px] text-gray-500">Taux pub.</p>
                    </div>
                    <div className="rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-lg font-bold text-purple-600">{veilleur.totalViews.toLocaleString('fr-FR')}</p>
                      <p className="text-[10px] text-gray-500">Vues</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Ranking Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <CardTitle>Classement détaillé des veilleurs</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Trier par :</span>
              <div className="flex gap-1">
                {[
                  { key: 'total', label: 'Articles' },
                  { key: 'published', label: 'Publiés' },
                  { key: 'views', label: 'Vues' },
                  { key: 'rate', label: 'Taux' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key as any)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      sortBy === opt.key
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left font-semibold text-gray-600">#</th>
                  <th className="pb-3 text-left font-semibold text-gray-600">Veilleur</th>
                  <th className="pb-3 text-center font-semibold text-gray-600">Total</th>
                  <th className="pb-3 text-center font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-1"><Send className="h-3.5 w-3.5 text-green-500" /> Publiés</span>
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-blue-500" /> Validés</span>
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-500" /> En attente</span>
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5 text-red-500" /> Rejetés</span>
                  </th>
                  <th className="pb-3 text-center font-semibold text-gray-600">Taux pub.</th>
                  <th className="pb-3 text-center font-semibold text-gray-600">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Vues</span>
                  </th>
                  <th className="pb-3 text-right font-semibold text-gray-600">Dernier article</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedVeilleurs.map((veilleur, index) => (
                  <tr key={veilleur.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-2">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={veilleur.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{veilleur.name}</p>
                          <p className="text-xs text-gray-400">{veilleur.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-bold text-gray-900">{veilleur.total}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-semibold text-green-600">{veilleur.published}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-blue-600">{veilleur.approved}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-amber-600">{veilleur.pending}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-red-500">{veilleur.rejected}</span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`font-semibold ${
                          veilleur.publicationRate >= 70 ? 'text-green-600' :
                          veilleur.publicationRate >= 40 ? 'text-amber-600' :
                          'text-red-500'
                        }`}>
                          {veilleur.publicationRate}%
                        </span>
                        {veilleur.publicationRate >= 70 ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                        ) : veilleur.publicationRate < 40 ? (
                          <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-gray-600">{veilleur.totalViews.toLocaleString('fr-FR')}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-xs text-gray-400">{formatDate(veilleur.lastArticleDate)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedVeilleurs.length === 0 && (
            <p className="text-center text-gray-500 py-6">Aucun veilleur trouvé</p>
          )}
        </CardContent>
      </Card>

      {/* Veilleur detail cards (expanded view of top performers) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Acceptance rate distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <CardTitle>Taux d'acceptation par veilleur</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedVeilleurs.map((veilleur) => {
                return (
                  <div key={veilleur.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{veilleur.name}</span>
                      <span className={`text-sm font-semibold ${
                        veilleur.acceptanceRate >= 70 ? 'text-green-600' :
                        veilleur.acceptanceRate >= 40 ? 'text-amber-600' :
                        'text-red-500'
                      }`}>
                        {veilleur.acceptanceRate}%
                      </span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                      {veilleur.total > 0 && (
                        <>
                          <div
                            className="bg-green-500"
                            style={{ width: `${(veilleur.published / veilleur.total) * 100}%` }}
                            title={`${veilleur.published} publiés`}
                          />
                          <div
                            className="bg-blue-400"
                            style={{ width: `${(veilleur.approved / veilleur.total) * 100}%` }}
                            title={`${veilleur.approved} validés`}
                          />
                          <div
                            className="bg-amber-400"
                            style={{ width: `${(veilleur.pending / veilleur.total) * 100}%` }}
                            title={`${veilleur.pending} en attente`}
                          />
                          <div
                            className="bg-red-400"
                            style={{ width: `${(veilleur.rejected / veilleur.total) * 100}%` }}
                            title={`${veilleur.rejected} rejetés`}
                          />
                          <div
                            className="bg-gray-300"
                            style={{ width: `${(veilleur.draft / veilleur.total) * 100}%` }}
                            title={`${veilleur.draft} brouillons`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Publiés</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-400" /> Validés</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> En attente</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Rejetés</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Brouillons</span>
            </div>
          </CardContent>
        </Card>

        {/* Productivity: articles per veilleur bar chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle>Productivité (nombre d'articles)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {sortedVeilleurs.map((veilleur, index) => {
                const maxTotal = sortedVeilleurs[0]?.total || 1;
                const barWidth = Math.max((veilleur.total / maxTotal) * 100, 3);
                return (
                  <div key={veilleur.id} className="flex items-center gap-3">
                    <span className="w-24 truncate text-sm font-medium text-gray-600">{veilleur.name.split(' ')[0]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="h-6 rounded-md bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-md flex items-center justify-end pr-2 transition-all duration-700 ${
                            index === 0 ? 'bg-indigo-500' : index < 3 ? 'bg-indigo-400' : 'bg-indigo-300'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        >
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">
                            {veilleur.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
