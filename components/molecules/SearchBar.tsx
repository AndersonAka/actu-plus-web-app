'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

const SearchBar = ({
  placeholder = 'Rechercher...',
  defaultValue = '',
  onSearch,
  className,
  size = 'md',
  autoFocus = false,
}: SearchBarProps) => {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const sizes = {
    sm: 'py-2 pl-9 pr-8 text-sm',
    md: 'py-2.5 pl-10 pr-10 text-base',
    lg: 'py-3 pl-12 pr-12 text-lg',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconPositions = {
    sm: 'left-2.5',
    md: 'left-3',
    lg: 'left-4',
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/articles?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-gray-400',
          iconSizes[size],
          iconPositions[size]
        )}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white transition-colors',
          'placeholder:text-gray-400',
          'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          sizes[size]
        )}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600',
            iconSizes[size]
          )}
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </form>
  );
};

export { SearchBar };
