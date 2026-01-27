'use client';

import { cn } from '@/lib/utils/cn';
import { ArticleCard } from '@/components/molecules';
import { Pagination } from '@/components/molecules';
import { EmptyState, SkeletonCard } from '@/components/atoms';
import { Article } from '@/types';

export interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
  showStatus?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onFavorite?: (id: string) => void;
  favoriteIds?: string[];
  emptyMessage?: string;
  className?: string;
  gridCols?: 1 | 2 | 3 | 4;
}

const ArticleList = ({
  articles,
  isLoading = false,
  showStatus = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onFavorite,
  favoriteIds = [],
  emptyMessage = 'Aucun article trouvé',
  className,
  gridCols = 3,
}: ArticleListProps) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (isLoading) {
    return (
      <div className={cn('grid gap-6', gridClasses[gridCols], className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Essayez de modifier vos filtres ou revenez plus tard."
        icon="empty"
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className={cn('grid gap-6', gridClasses[gridCols])}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            showStatus={showStatus}
            onFavorite={onFavorite}
            isFavorite={favoriteIds.includes(article.id)}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export { ArticleList };
