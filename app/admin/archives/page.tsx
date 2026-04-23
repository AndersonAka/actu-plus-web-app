'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/atoms';
import { Button } from '@/components/atoms';
import { Pagination } from '@/components/molecules';
import { 
  Archive, 
  Clock, 
  User, 
  Loader2, 
  Filter,
  Calendar,
  TrendingUp,
  FileText,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { Article, ArticleStatus } from '@/types';

type ArchiveType = 'system' | 'watcher';

interface ArchiveStats {
  system: {
    total: number;
    today: number;
    thisWeek: number;
  };
  watcher: {
    total: number;
    today: number;
    thisWeek: number;
  };
}

// Mapper les données du backend
function mapArticle(data: any): Article {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: data.imageUrl,
    category: data.category || { id: '', name: 'Actualité', slug: 'actualite' },
    country: data.country,
    author: data.author || { id: '', firstName: '', lastName: '', email: '' },
    status: data.isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
    isFeatured: data.isFeatured,
    isPremium: data.isPremium || false,
    views: data.views || 0,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default function AdminArchivesPage() {
  const [activeTab, setActiveTab] = useState<ArchiveType>('system');
  const [systemArticles, setSystemArticles] = useState<Article[]>([]);
  const [watcherArticles, setWatcherArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Charger les archives système
  const loadSystemArchives = useCallback(async (search?: string) => {
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      // Articles archivés automatiquement (archivedById IS NULL) - via endpoint admin
      const response = await fetch(`/api/proxy/articles/admin?isArchive=true&archivedBySystem=true&limit=50${searchParam}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des archives système');
      }
      
      const result = await response.json();
      const articles = (result.data?.data || result.data || []).map(mapArticle);
      setSystemArticles(articles);
    } catch (err) {
      console.error('Erreur lors du chargement des archives système:', err);
      setError('Impossible de charger les archives système');
    }
  }, []);

  // Charger les archives veilleur
  const loadWatcherArchives = useCallback(async (search?: string) => {
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      // Articles archivés par les veilleurs (archivedById IS NOT NULL) - via endpoint admin
      const response = await fetch(`/api/proxy/articles/admin?isArchive=true&archivedByWatcher=true&limit=50${searchParam}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des archives veilleur');
      }
      
      const result = await response.json();
      const articles = (result.data?.data || result.data || []).map(mapArticle);
      setWatcherArticles(articles);
    } catch (err) {
      console.error('Erreur lors du chargement des archives veilleur:', err);
      setError('Impossible de charger les archives veilleur');
    }
  }, []);

  // Charger les stats
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch('/api/proxy/articles/archive-stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
    }
  }, []);

  // Charger toutes les données
  const loadData = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      loadSystemArchives(search),
      loadWatcherArchives(search),
      loadStats()
    ]);
    
    setLoading(false);
  }, [loadSystemArchives, loadWatcherArchives, loadStats]);

  // Rechercher
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
    loadData(searchInput.trim());
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    loadData('');
  };

  // Désarchiver un article
  const handleUnarchive = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désarchiver cet article ?')) return;
    
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/unarchive`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Recharger les données
        loadData();
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors du désarchivage');
      }
    } catch (err) {
      console.error('Erreur lors du désarchivage:', err);
      alert('Erreur lors du désarchivage');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabs = [
    {
      id: 'system' as ArchiveType,
      label: 'Archivés par le système',
      icon: Clock,
      description: 'Articles archivés automatiquement après 24h',
      count: systemArticles.length,
    },
    {
      id: 'watcher' as ArchiveType,
      label: 'Archivés par les veilleurs',
      icon: User,
      description: 'Articles archivés manuellement par les veilleurs',
      count: watcherArticles.length,
    },
  ];

  const currentArticles = activeTab === 'system' ? systemArticles : watcherArticles;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(currentArticles.length / PAGE_SIZE)),
    [currentArticles.length]
  );
  const paginatedCurrentArticles = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentArticles.slice(start, start + PAGE_SIZE);
  }, [currentArticles, currentPage]);
  const currentTab = tabs.find(tab => tab.id === activeTab);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des archives</h1>
        <p className="mt-1 text-gray-600">
          Consultez et gérez les articles archivés par le système et par les veilleurs
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total système</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.system.total}</p>
                <p className="mt-1 text-xs text-gray-400">{stats.system.today} aujourd'hui</p>
              </div>
              <div className="rounded-lg p-2.5 bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total veilleurs</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats.watcher.total}</p>
                <p className="mt-1 text-xs text-gray-400">{stats.watcher.today} aujourd'hui</p>
              </div>
              <div className="rounded-lg p-2.5 bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Cette semaine</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.system.thisWeek + stats.watcher.thisWeek}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {stats.system.thisWeek} système + {stats.watcher.thisWeek} veilleurs
                </p>
              </div>
              <div className="rounded-lg p-2.5 bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total archives</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.system.total + stats.watcher.total}
                </p>
                <p className="mt-1 text-xs text-gray-400">Tous types confondus</p>
              </div>
              <div className="rounded-lg p-2.5 bg-amber-100">
                <Archive className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" size="sm" className="ml-2">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un article archivé..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="primary" size="sm">
          Rechercher
        </Button>
      </form>

      {/* Résultat de recherche */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Résultats pour</span>
          <Badge variant="secondary">"{searchQuery}"</Badge>
          <button onClick={clearSearch} className="text-primary-600 hover:underline">
            Effacer
          </button>
        </div>
      )}

      {/* Tab Description */}
      {currentTab && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <currentTab.icon className="h-5 w-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">{currentTab.label}</h3>
              <p className="text-sm text-gray-600">{currentTab.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => loadData(searchQuery)}
          >
            Réessayer
          </Button>
        </div>
      )}

      {/* Articles List */}
      {!error && (
        <>
          {currentArticles.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-12 text-center">
              <Archive className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Aucun article archivé
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {activeTab === 'system' 
                  ? 'Aucun article n\'a été archivé automatiquement par le système.'
                  : 'Aucun article n\'a été archivé par les veilleurs.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {currentArticles.length} article{currentArticles.length !== 1 ? 's' : ''} trouvé{currentArticles.length !== 1 ? 's' : ''}
                </p>
                <Button variant="outline" size="sm" onClick={() => loadData(searchQuery)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
              </div>

              {totalPages > 1 && (
                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
              
              <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                {paginatedCurrentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Image */}
                      {(article.coverImage || article.imageUrl) && (
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <img 
                            src={article.coverImage || article.imageUrl} 
                            alt={article.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{article.title}</h4>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <span>{article.category?.name}</span>
                          <span>•</span>
                          <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-4">
                      <Badge variant="secondary" size="sm" className={activeTab === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {activeTab === 'system' ? (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Auto
                          </>
                        ) : (
                          <>
                            <User className="mr-1 h-3 w-3" />
                            Veilleur
                          </>
                        )}
                      </Badge>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchive(article.id)}
                        className="whitespace-nowrap"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Désarchiver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-2">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
