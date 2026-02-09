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
  variant?: 'default' | 'compact' | 'featured' | 'list';
  showStatus?: boolean;
  onFavorite?: (id: string) => void;
  isFavorite?: boolean;
  className?: string;
  fromCountry?: string;
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
  fromCountry,
}: ArticleCardProps) => {
  // Handle both coverImage and imageUrl from backend
  const imageUrl = article.coverImage || article.imageUrl;
  const articleUrl = fromCountry 
    ? `/articles/${article.id}?from=${fromCountry}` 
    : `/articles/${article.id}`;
  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd MMM yyyy', { locale: fr })
    : format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr });

  if (variant === 'compact') {
    return (
      <Link
        href={articleUrl}
        className={cn(
          'flex gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50',
          className
        )}
      >
        {imageUrl && (
          <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized={true}
            />
            {article.isPremium && (
              <div className="absolute right-1 top-1">
                <Badge variant="warning" size="sm" className="bg-amber-500 text-white text-xs px-1 py-0">
                  Contenu abonné
                </Badge>
              </div>
            )}
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

  if (variant === 'list') {
    return (
      <article
        className={cn(
          'group flex gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 transition-all duration-200 hover:shadow-md hover:border-gray-300',
          className
        )}
      >
        <Link href={articleUrl} className="relative h-28 w-40 flex-shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-48">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={true}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-xs text-gray-400">Pas d'image</span>
            </div>
          )}
          {article.isPremium && (
            <div className="absolute left-1.5 top-1.5">
              <Badge variant="warning" size="sm" className="bg-amber-500 text-white text-[10px] px-1.5 py-0">
                Contenu abonné
              </Badge>
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <Badge variant="secondary" size="sm">
                {article.category.name}
              </Badge>
              {showStatus && (
                <Badge variant={statusLabels[article.status].variant} size="sm">
                  {statusLabels[article.status].label}
                </Badge>
              )}
            </div>
            <Link href={articleUrl}>
              <h3 className="mb-1 line-clamp-2 text-[0.95rem] font-semibold leading-snug text-gray-900 group-hover:text-primary-600 transition-colors">
                {article.title}
              </h3>
            </Link>
            {article.excerpt && (
              <p className="line-clamp-2 text-sm text-gray-500 leading-relaxed hidden sm:block">
                {article.excerpt}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
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
                  'rounded-full p-1 transition-colors',
                  isFavorite
                    ? 'text-error-500 hover:bg-error-50'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-error-500'
                )}
              >
                <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={articleUrl}
        className={cn(
          'group relative block overflow-hidden rounded-xl',
          className
        )}
      >
        <div className="relative aspect-[16/9] w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={true}
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-2 flex gap-2">
            <Badge variant="primary">
              {article.category.name}
            </Badge>
            {article.isPremium && (
              <Badge variant="warning" className="bg-amber-500 text-white">
                Contenu abonné
              </Badge>
            )}
          </div>
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
        'group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      <Link href={articleUrl} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={true}
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Pas d'image</span>
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-2">
            {showStatus && (
              <Badge variant={statusLabels[article.status].variant}>
                {statusLabels[article.status].label}
              </Badge>
            )}
            {article.isFeatured && !showStatus && (
              <Badge variant="primary">À la une</Badge>
            )}
            {article.isPremium && (
              <Badge variant="warning" className="bg-amber-500 text-white">
                Contenu abonné
              </Badge>
            )}
          </div>
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
        <Link href={articleUrl}>
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
