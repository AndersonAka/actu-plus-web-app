'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button, Card, EmptyState } from '@/components/atoms';
import { Pagination, StatusBadge } from '@/components/molecules';
import { Article, ArticleStatus } from '@/types';
import { Plus, Search, X, RefreshCw, Archive, ArchiveRestore } from 'lucide-react';

const getArticleStatus = (article: Article): ArticleStatus => {
  if (article.status) return article.status;
  if (article.isPublished) return ArticleStatus.PUBLISHED;
  return ArticleStatus.DRAFT;
};

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: ArticleStatus.DRAFT, label: 'Brouillons' },
  { value: ArticleStatus.PENDING, label: 'En attente' },
  { value: ArticleStatus.APPROVED, label: 'Validés' },
  { value: ArticleStatus.REJECTED, label: 'Rejetés' },
  { value: ArticleStatus.PUBLISHED, label: 'Publiés' },
  { value: 'ARCHIVED', label: 'Archivés' },
];

export default function VeilleurArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce la recherche (400ms)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      // Récupérer tous les articles sans filtrage backend (compatibilité prod)
      const response = await fetch('/api/proxy/articles/my?page=1&limit=1000');
      if (response.ok) {
        const result = await response.json();
        const responseData = result.data || result;
        let allArticles: Article[] = responseData.data || responseData.articles || responseData;
        if (!Array.isArray(allArticles)) allArticles = [];

        // Filtrage côté client
        if (statusFilter === 'ARCHIVED') {
          allArticles = allArticles.filter((a) => a.isArchive === true);
        } else if (statusFilter) {
          allArticles = allArticles.filter((a) => getArticleStatus(a) === statusFilter && !a.isArchive);
        } else {
          // Par défaut, ne pas afficher les archivés
          allArticles = allArticles.filter((a) => !a.isArchive);
        }
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          allArticles = allArticles.filter((a) => a.title?.toLowerCase().includes(q));
        }

        // Pagination côté client
        const pageSize = 10;
        const totalFiltered = allArticles.length;
        const totalPagesCalc = Math.max(1, Math.ceil(totalFiltered / pageSize));
        const start = (currentPage - 1) * pageSize;
        const paginated = allArticles.slice(start, start + pageSize);

        setArticles(paginated);
        setTotal(totalFiltered);
        setTotalPages(totalPagesCalc);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== '' || statusFilter !== '';

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

  const handleUnarchive = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désarchiver cet article ?')) return;
    try {
      const response = await fetch(`/api/proxy/articles/${articleId}/unarchive`, { method: 'POST' });
      if (response.ok) {
        fetchArticles();
      } else {
        const data = await response.json();
        alert(data.message || 'Erreur lors du désarchivage');
      }
    } catch (error) {
      console.error('Unarchive error:', error);
      alert('Erreur lors du désarchivage');
    }
  };

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

      <Card padding="none">
        {/* Barre de filtres */}
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center">
          {/* Champ de recherche */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-sm text-gray-700 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Bouton réinitialiser */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}

            {/* Compteur */}
            {!isLoading && (
              <span className="whitespace-nowrap text-sm text-gray-400">
                {total} article{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Liste des articles */}
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-50 px-4 py-4">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/3 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={hasActiveFilters ? 'Aucun résultat' : 'Aucun article'}
              description={
                hasActiveFilters
                  ? 'Aucun article ne correspond à vos critères de recherche.'
                  : "Vous n'avez pas encore créé d'article."
              }
              action={
                hasActiveFilters
                  ? { label: 'Réinitialiser les filtres', onClick: handleReset }
                  : { label: 'Créer un article', onClick: () => (window.location.href = '/veilleur/articles/create') }
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {articles.map((article) => {
              const status = getArticleStatus(article);
              const canEdit = status === ArticleStatus.DRAFT || status === ArticleStatus.REJECTED;
              const canArchive = status === ArticleStatus.DRAFT && !article.isArchive;
              const isArchived = article.isArchive === true;

              return (
                <div
                  key={article.id}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 ${isArchived ? 'bg-gray-50/50' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={canEdit && !isArchived ? `/veilleur/articles/${article.id}/edit` : `/veilleur/articles/${article.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {article.title}
                      {isArchived && <span className="ml-2 text-xs text-gray-400">(Archivé)</span>}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                      <span>{article.category?.name || 'Sans catégorie'}</span>
                      <span>•</span>
                      <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isArchived ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <Archive className="mr-1 h-3 w-3" />
                        Archivé
                      </span>
                    ) : (
                      <StatusBadge status={status} />
                    )}
                    {isArchived ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnarchive(article.id)}
                        title="Désarchiver"
                      >
                        <ArchiveRestore className="h-4 w-4 mr-1" />
                        Désarchiver
                      </Button>
                    ) : canArchive ? (
                      <>
                        <Link href={`/veilleur/articles/${article.id}/edit`}>
                          <Button variant="ghost" size="sm">Modifier</Button>
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
                      </>
                    ) : canEdit ? (
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
        )}
      </Card>

      {totalPages > 1 && !isLoading && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
