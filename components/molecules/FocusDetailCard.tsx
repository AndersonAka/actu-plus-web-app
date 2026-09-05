'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { getArticlePublicPath } from '@/lib/articles/article-url';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Eye, ChevronRight, Crown } from 'lucide-react';

export interface FocusDetailCardProps {
  article: Article;
  sectionTitle: string;
  sectionColor?: 'red' | 'blue';
  fromCountry?: string;
}

export const FocusDetailCard = ({
  article,
  sectionTitle,
  sectionColor = 'red',
  fromCountry,
}: FocusDetailCardProps) => {
  const imageUrl = article.coverImage || article.imageUrl;
  const articleUrl = fromCountry
    ? `${getArticlePublicPath(article)}?from=${fromCountry}`
    : getArticlePublicPath(article);

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "EEEE dd MMMM yyyy", { locale: fr })
    : format(new Date(article.createdAt), "EEEE dd MMMM yyyy", { locale: fr });

  const colorClasses = sectionColor === 'red'
    ? {
        headerBg: 'bg-[#ec3013]',
        headerText: 'text-white',
        accentBorder: 'border-[#ec3013]',
        accentText: 'text-[#ae1800]',
        accentBg: 'bg-[#fff2ef]',
        badgeBg: 'bg-[#ffe0d9]',
        ctaBg: 'bg-[#ec3013] hover:bg-[#dd2b0f]',
        divider: 'bg-[#ec3013]',
      }
    : {
        headerBg: 'bg-[#201e1d]',
        headerText: 'text-white',
        accentBorder: 'border-[#201e1d]',
        accentText: 'text-[#201e1d]',
        accentBg: 'bg-[#f8f4f4]',
        badgeBg: 'bg-[#eae9e9]',
        ctaBg: 'bg-[#201e1d] hover:bg-[#2d2b2b]',
        divider: 'bg-[#201e1d]',
      };

  // Extract plain text from HTML content for preview
  const getTextPreview = (html: string, maxLength: number = 600): string => {
    if (typeof window === 'undefined') {
      // Server-side: strip HTML tags with regex
      const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = (tempDiv.textContent || tempDiv.innerText || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const contentPreview = article.excerpt || getTextPreview(article.content || '');

  return (
    <div className="overflow-hidden border border-[#201e1d]/40 bg-white">
      {/* Header Bar - Style journal */}
      <div className={`${colorClasses.headerBg} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-white/40" />
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${colorClasses.headerText} opacity-80`}>
                {formattedDate}
              </p>
              <h3 className={`text-xl font-extrabold tracking-tight ${colorClasses.headerText} sm:text-2xl`}>
                {sectionTitle}
              </h3>
            </div>
          </div>
          {article.isPremium && (
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1">
              <Crown className="h-4 w-4 text-[#ffe0d9]" />
              <span className="text-xs font-semibold text-white">Contenu abonné</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider line */}
      <div className={`h-1 ${colorClasses.divider}`} />

      {/* Title */}
      <div className={`border-b border-[#d7d3d3] px-6 py-5 ${colorClasses.accentBg}`}>
        <h2 className="text-xl font-extrabold leading-tight text-[#201e1d] sm:text-2xl lg:text-[1.65rem]">
          {article.title}
        </h2>
      </div>

      {/* Content area - Image left + text wrapping */}
      <div className="px-6 py-6">
        <div className="relative">
          {/* Image floated left */}
          {imageUrl && (
            <div className="mb-4 mr-6 float-left w-full sm:w-70 lg:w-80">
              <div className="relative aspect-4/3 overflow-hidden border border-[#d7d3d3]">
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Article text content */}
          <div className="text-[0.95rem] leading-relaxed text-[#605d5d]">
            {article.excerpt && (
              <p className="mb-4 font-semibold text-[#201e1d] leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <p className="text-[#605d5d] leading-[1.75]">
              {article.excerpt ? getTextPreview(article.content || '', 400) : contentPreview}
            </p>
          </div>

          {/* Clear float */}
          <div className="clear-both" />
        </div>

        {/* Meta info + CTA */}
        <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 border-t ${colorClasses.accentBorder}/20 pt-5`}>
          <div className="flex items-center gap-4 text-sm text-[#9b9797]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.publishedAt
                ? format(new Date(article.publishedAt), 'dd MMM yyyy à HH:mm', { locale: fr })
                : format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr })}
            </span>
            {article.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {article.views} vue{article.views > 1 ? 's' : ''}
              </span>
            )}
            {article.category?.name && (
              <span className={`px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide ${colorClasses.badgeBg} ${colorClasses.accentText}`}>
                {article.category.name}
              </span>
            )}
          </div>

          <Link
            href={articleUrl}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-colors ${colorClasses.ctaBg}`}
          >
            Lire l'article complet
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
