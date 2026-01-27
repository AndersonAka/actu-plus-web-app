'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Category } from '@/types';
import { ChevronRight } from 'lucide-react';

export interface CategoryCardProps {
  category: Category;
  articleCount?: number;
  className?: string;
}

const CategoryCard = ({
  category,
  articleCount,
  className,
}: CategoryCardProps) => {
  return (
    <Link
      href={`/categories/${category.id}`}
      className={cn(
        'group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary-200 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {category.icon && (
          <span className="text-2xl">{category.icon}</span>
        )}
        <div>
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
            {category.name}
          </h3>
          {category.description && (
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">
              {category.description}
            </p>
          )}
          {articleCount !== undefined && (
            <p className="mt-0.5 text-xs text-gray-400">
              {articleCount} article{articleCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
    </Link>
  );
};

export { CategoryCard };
