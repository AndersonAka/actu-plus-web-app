'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Article } from '@/types';
import { ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface SummarySectionProps {
  article?: Article;
  className?: string;
}

const SummarySection = ({ article, className }: SummarySectionProps) => {
  return (
    <div className={cn('border-b border-gray-200 bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Résumé de l'actualité
          </h2>
          <Link
            href="/articles"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Voir plus
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Article */}
        {article ? (
          <div className="pb-4">
            <Link href={`/articles/${article.id}`}>
              <div className="flex gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50">
                {/* Image */}
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                  {article.coverImage ? (
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                      <span className="text-lg font-bold text-primary-400">A+</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-primary-600">
                    {article.category?.name || 'Actualité'}
                  </span>
                  <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(article.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="pb-4">
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">Aucun article disponible</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { SummarySection };
