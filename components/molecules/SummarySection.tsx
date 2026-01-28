'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { ChevronRight, Clock, FileText, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CountrySummary {
  countryCode: string;
  countryName: string;
  summary: {
    id: string;
    title: string;
    excerpt?: string;
    createdAt: string;
    publishedAt?: string;
  } | null;
}

export interface SummarySectionProps {
  summaries?: CountrySummary[];
  className?: string;
}

const SummarySection = ({ summaries = [], className }: SummarySectionProps) => {
  const validSummaries = summaries.filter(s => s.summary !== null);

  return (
    <div className={cn('border-b border-gray-200 bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              Résumé de l'actualité par pays
            </h2>
          </div>
        </div>

        {/* Summaries by country */}
        {validSummaries.length > 0 ? (
          <div className="pb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validSummaries.map((item) => (
              <Link 
                key={item.countryCode} 
                href={`/country/${item.countryCode.toLowerCase()}`}
                className="block"
              >
                <div className="flex gap-3 rounded-lg border border-gray-100 p-3 transition-all hover:bg-gray-50 hover:border-primary-200 hover:shadow-sm">
                  {/* Country flag icon */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200">
                    <Globe className="h-6 w-6 text-primary-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary-600 uppercase">
                        {item.countryName}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
                      {item.summary?.title}
                    </h3>
                    {item.summary?.excerpt && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                        {item.summary.excerpt}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(item.summary?.publishedAt || item.summary?.createdAt || new Date()), 'dd MMM', { locale: fr })}
                      </span>
                      <ChevronRight className="h-3 w-3 ml-auto text-primary-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pb-4">
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Aucun résumé disponible</p>
              <p className="text-xs text-gray-400 mt-1">Les résumés sont générés par les veilleurs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { SummarySection };
