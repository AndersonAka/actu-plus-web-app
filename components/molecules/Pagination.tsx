'use client';

import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);

    let start = Math.max(1, currentPage - halfShow);
    let end = Math.min(totalPages, currentPage + halfShow);

    if (currentPage <= halfShow) {
      end = Math.min(totalPages, showPages);
    }
    if (currentPage > totalPages - halfShow) {
      start = Math.max(1, totalPages - showPages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const buttonBase =
    'flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors';

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          buttonBase,
          'text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
        )}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-gray-400"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              buttonBase,
              isActive
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          buttonBase,
          'text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
        )}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
};

export { Pagination };
