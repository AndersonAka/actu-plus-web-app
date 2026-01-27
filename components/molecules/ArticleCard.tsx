'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/atoms';
import { Calendar, Eye, Heart } from 'lucide-react';
import { Article, ArticleStatus } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
  showStatus?: boolean;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  className?: string;
}

const statusLabels: Record<ArticleStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  [ArticleStatus.DRAFT]: { label: 'Brouillon', variant: 'default' },
  [ArticleStatus.PENDING]: { label: 'En attente', variant: 'warning' },
  [ArticleStatus.APPROVED]: { label: 'Validé', variant: 'primary' },
  [ArticleStatus.REJECTED]: { label: 'Rejeté', variant: 'error' },
  [ArticleStatus.PUBLISHED]: { label: 'Publié', variant: 'success' },
  [ArticleStatus.ARCHIVED]: { label: 'Archivé', variant: 'default' },
};

const ArticleCard = ({
  article,
  variant = 'default',
  showStatus = false,
  onFavorite,
  isFavorite = false,
  className,
}: ArticleCardProps) => {
  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd MMM yyyy', { locale: fr })
    : format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr });

  if (variant === 'compact') {
    return (
      <Link
        href={`/articles/${article.id}`}
        className={cn(
          'flex gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50',
          className
        )}
      >
        {article.coverImage && (
          <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="line-clamp-2 text-sm font-medium text-gray-900">
            {article.title}
          </h4>
          <p className="mt-1 text-xs text-gray-500">{formattedDate}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/articles/${article.id}`}
        className={cn(
          'group relative block overflow-hidden rounded-xl',
          className
        )}
      >
        <div className="relative aspect-[16/9] w-full">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Badge variant="primary" className="mb-2">
            {article.category.name}
          </Badge>
          <h2 className="mb-2 line-clamp-2 text-2xl font-bold text-white">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="line-clamp-2 text-sm text-gray-200">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md',
        className
      )}
    >
      <Link href={`/articles/${article.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
          {showStatus && (
            <div className="absolute left-2 top-2">
              <Badge variant={statusLabels[article.status].variant}>
                {statusLabels[article.status].label}
              </Badge>
            </div>
          )}
          {article.isFeatured && !showStatus && (
            <div className="absolute left-2 top-2">
              <Badge variant="primary">À la une</Badge>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" size="sm">
            {article.category.name}
          </Badge>
          {article.country && (
            <span className="text-xs text-gray-500">{article.country.name}</span>
          )}
        </div>
        <Link href={`/articles/${article.id}`}>
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-primary-600">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {article.views}
            </span>
          </div>
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavorite(article.id);
              }}
              className={cn(
                'rounded-full p-1.5 transition-colors',
                isFavorite
                  ? 'text-error-500 hover:bg-error-50'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-error-500'
              )}
            >
              <Heart
                className={cn('h-5 w-5', isFavorite && 'fill-current')}
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export { ArticleCard };
