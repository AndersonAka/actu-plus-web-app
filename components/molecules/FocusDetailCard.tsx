'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
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
    ? `/articles/${article.id}?from=${fromCountry}`
    : `/articles/${article.id}`;

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "EEEE dd MMMM yyyy", { locale: fr })
    : format(new Date(article.createdAt), "EEEE dd MMMM yyyy", { locale: fr });

  const colorClasses = sectionColor === 'red'
    ? {
        headerBg: 'bg-gradient-to-r from-red-600 to-red-700',
        headerText: 'text-white',
        accentBorder: 'border-red-600',
        accentText: 'text-red-600',
        accentBg: 'bg-red-50',
        linkHover: 'hover:text-red-700',
        divider: 'bg-red-600',
      }
    : {
        headerBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
        headerText: 'text-white',
        accentBorder: 'border-blue-600',
        accentText: 'text-blue-600',
        accentBg: 'bg-blue-50',
        linkHover: 'hover:text-blue-700',
        divider: 'bg-blue-600',
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Header Bar - Style journal */}
      <div className={`${colorClasses.headerBg} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-1 rounded-full bg-white/40`} />
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
            <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <Crown className="h-4 w-4 text-yellow-300" />
              <span className="text-xs font-semibold text-white">Contenu abonné</span>
            </div>
          )}
        </div>
      </div>

      {/* Divider line */}
      <div className={`h-1 ${colorClasses.divider}`} />

      {/* Title */}
      <div className={`border-b border-gray-200 px-6 py-5 ${colorClasses.accentBg}`}>
        <h2 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl lg:text-[1.65rem]">
          {article.title}
        </h2>
      </div>

      {/* Content area - Image left + text wrapping */}
      <div className="px-6 py-6">
        <div className="relative">
          {/* Image floated left */}
          {imageUrl && (
            <div className="mb-4 mr-6 float-left w-full sm:w-[280px] lg:w-[320px]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-md">
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
          <div className="text-[0.95rem] leading-relaxed text-gray-700">
            {article.excerpt && (
              <p className="mb-4 font-semibold text-gray-800 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <p className="text-gray-600 leading-[1.75]">
              {article.excerpt ? getTextPreview(article.content || '', 400) : contentPreview}
            </p>
          </div>

          {/* Clear float */}
          <div className="clear-both" />
        </div>

        {/* Meta info + CTA */}
        <div className={`mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5 ${colorClasses.accentBorder} border-opacity-20`}>
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClasses.accentBg} ${colorClasses.accentText}`}>
                {article.category.name}
              </span>
            )}
          </div>

          <Link
            href={articleUrl}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 ${
              sectionColor === 'red'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            } shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
          >
            Lire l'article complet
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
