'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export type CountryCode = string;

export interface Country {
  id: string;
  code: string;
  name: string;
  flag?: string;
  isActive?: boolean;
}

export interface CountryTabsProps {
  activeCountry?: CountryCode;
  onCountryChange?: (country: CountryCode) => void;
  className?: string;
}

const CountryTabs = ({ activeCountry, onCountryChange, className }: CountryTabsProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/proxy/countries');
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          const list = Array.isArray(data) ? data : (data.data || data.countries || []);
          // Filtrer uniquement les pays actifs
          const activeCountries = list.filter((c: Country) => c.isActive !== false);
          setCountries(activeCountries);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCountries();
  }, []);

  if (isLoading) {
    return (
      <div className={cn('border-b border-gray-200 bg-white', className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (countries.length === 0) {
    return null;
  }

  return (
    <div className={cn('border-b border-gray-200 bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {countries.map((country) => {
            const isActive = activeCountry === country.code.toLowerCase();
            return (
              <button
                key={country.id}
                onClick={() => onCountryChange?.(country.code.toLowerCase())}
                className={cn(
                  'relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {country.flag && <span className="text-base">{country.flag}</span>}
                <span>{country.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { CountryTabs };
