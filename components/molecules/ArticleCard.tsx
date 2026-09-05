'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/atoms';
import { Calendar, Eye, Heart, Globe } from 'lucide-react';
import { Article, ArticleStatus } from '@/types';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { getArticleCategoryLabel } from '@/lib/articles/article-labels';
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

const statusStyles: Record<ArticleStatus, { label: string; className: string }> = {
  [ArticleStatus.DRAFT]: { label: 'Brouillon', className: 'bg-[#eae9e9] text-[#605d5d]' },
  [ArticleStatus.PENDING]: { label: 'En attente', className: 'bg-[#ffe0d9] text-[#ae1800]' },
  [ArticleStatus.APPROVED]: { label: 'Validé', className: 'bg-[#ffe0d9] text-[#ae1800]' },
  [ArticleStatus.REJECTED]: { label: 'Rejeté', className: 'bg-[#eae9e9] text-[#201e1d]' },
  [ArticleStatus.PUBLISHED]: { label: 'Publié', className: 'bg-[#201e1d] text-white' },
  [ArticleStatus.ARCHIVED]: { label: 'Archivé', className: 'bg-[#eae9e9] text-[#605d5d]' },
};

const badgeReset = 'rounded-none px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em]';

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
    ? `${getArticlePublicPath(article)}?from=${fromCountry}`
    : getArticlePublicPath(article);
  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd MMM yyyy', { locale: fr })
    : format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr });

  const scopeLabel = article.scope === 'international' ? 'International' : article.scope === 'national' ? 'National' : null;
  const categoryLabel = getArticleCategoryLabel(article);

  if (variant === 'compact') {
    return (
      <Link
        href={articleUrl}
        className={cn(
          'flex gap-3 p-2 transition-colors hover:bg-[#eae9e9]',
          className
        )}
      >
        {imageUrl && (
          <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized={true}
            />
            {article.isPremium && (
              <div className="absolute right-1 top-1">
                <Badge size="sm" className={cn(badgeReset, 'bg-[#ec3013] text-white')}>
                  Abonné
                </Badge>
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="line-clamp-2 text-sm font-semibold text-[#201e1d]">
            {article.title}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-[#605d5d]">{formattedDate}</p>
            {scopeLabel && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#605d5d]">
                <Globe className="h-2.5 w-2.5" />
                {scopeLabel}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'list') {
    return (
      <article
        className={cn(
          'group flex gap-4 border border-[#d7d3d3] bg-[#f3f2f2] p-3 transition-colors hover:border-[#201e1d]/40',
          className
        )}
      >
        <Link href={articleUrl} className="relative h-28 w-40 flex-shrink-0 overflow-hidden sm:h-32 sm:w-48">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#eae9e9]">
              <span className="text-xs text-[#9b9797]">Pas d'image</span>
            </div>
          )}
          {article.isPremium && (
            <div className="absolute left-1.5 top-1.5">
              <Badge size="sm" className={cn(badgeReset, 'bg-[#ec3013] text-white')}>
                Abonné
              </Badge>
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
          <div>
            <div className="mb-1.5 flex items-center gap-2 flex-wrap">
              {categoryLabel && (
                <Badge size="sm" className={cn(badgeReset, 'bg-[#eae9e9] text-[#201e1d]')}>
                  {categoryLabel}
                </Badge>
              )}
              {scopeLabel && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#605d5d]">
                  <Globe className="h-2.5 w-2.5" />
                  {scopeLabel}
                </span>
              )}
              {showStatus && (
                <Badge size="sm" className={cn(badgeReset, statusStyles[article.status].className)}>
                  {statusStyles[article.status].label}
                </Badge>
              )}
            </div>
            <Link href={articleUrl}>
              <h3 className="mb-1 line-clamp-2 text-[0.95rem] font-bold leading-snug text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
                {article.title}
              </h3>
            </Link>
            {article.excerpt && (
              <p className="line-clamp-2 text-sm text-[#605d5d] leading-relaxed hidden sm:block">
                {article.excerpt}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[#9b9797]">
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
                title="Ajouter aux favoris"
                onClick={(e) => {
                  e.preventDefault();
                  onFavorite(article.id);
                }}
                className={cn(
                  'p-1 transition-colors',
                  isFavorite
                    ? 'text-[#ec3013]'
                    : 'text-[#9b9797] hover:text-[#ec3013]'
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
          'group relative block overflow-hidden',
          className
        )}
      >
        <div className="relative aspect-[16/9] w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="h-full w-full bg-[#eae9e9]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-2 flex gap-2 flex-wrap">
            {categoryLabel && (
              <Badge className={cn(badgeReset, 'bg-[#ec3013] text-white')}>
                {categoryLabel}
              </Badge>
            )}
            {scopeLabel && (
              <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-white backdrop-blur-sm">
                <Globe className="h-3 w-3" />
                {scopeLabel}
              </span>
            )}
            {article.isPremium && (
              <Badge className={cn(badgeReset, 'bg-white text-[#201e1d]')}>
                Abonné
              </Badge>
            )}
          </div>
          <h2 className="mb-2 line-clamp-2 text-2xl font-extrabold text-white">
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
        'group overflow-hidden border border-[#d7d3d3] bg-[#f3f2f2] transition-colors hover:border-[#201e1d]/40',
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
              className="object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="h-full w-full bg-[#eae9e9] flex items-center justify-center">
              <span className="text-[#9b9797]">Pas d'image</span>
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-2 flex-wrap">
            {showStatus && (
              <Badge className={cn(badgeReset, statusStyles[article.status].className)}>
                {statusStyles[article.status].label}
              </Badge>
            )}
            {(article.isFeaturedHome || article.isFeatured) && !showStatus && (
              <Badge className={cn(badgeReset, 'bg-[#ec3013] text-white')}>À la une</Badge>
            )}
            {scopeLabel && (
              <span className="inline-flex items-center gap-0.5 bg-white/90 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#201e1d]">
                <Globe className="h-3 w-3" />
                {scopeLabel}
              </span>
            )}
            {article.isPremium && (
              <Badge className={cn(badgeReset, 'bg-white text-[#201e1d]')}>
                Abonné
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {categoryLabel && (
            <Badge size="sm" className={cn(badgeReset, 'bg-[#eae9e9] text-[#201e1d]')}>
              {categoryLabel}
            </Badge>
          )}
          {article.country && (
            <span className="text-xs text-[#605d5d]">{article.country.name}</span>
          )}
        </div>
        <Link href={articleUrl}>
          <h3 className="mb-2 line-clamp-2 font-bold text-[#201e1d] group-hover:text-[#ec3013] transition-colors">
            {article.title}
          </h3>
        </Link>
        {article.excerpt && (
          <p className="mb-3 line-clamp-2 text-sm text-[#605d5d]">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-[#9b9797]">
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
              title="Ajouter aux favoris"
              onClick={(e) => {
                e.preventDefault();
                onFavorite(article.id);
              }}
              className={cn(
                'p-1.5 transition-colors',
                isFavorite
                  ? 'text-[#ec3013]'
                  : 'text-[#9b9797] hover:text-[#ec3013]'
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
