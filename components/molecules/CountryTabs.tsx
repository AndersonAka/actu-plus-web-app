'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export type CountryCode = 'ci' | 'sn' | 'tg' | 'bf' | 'gn' | 'bj';

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'ci', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'sn', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'tg', name: 'Togo', flag: '🇹🇬' },
  { code: 'bf', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'gn', name: 'Guinée', flag: '🇬🇳' },
  { code: 'bj', name: 'Bénin', flag: '🇧🇯' },
];

export interface CountryTabsProps {
  activeCountry?: CountryCode;
  onCountryChange?: (country: CountryCode) => void;
  className?: string;
}

const CountryTabs = ({ activeCountry, onCountryChange, className }: CountryTabsProps) => {
  return (
    <div className={cn('border-b border-gray-200 bg-white', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {COUNTRIES.map((country) => {
            const isActive = activeCountry === country.code;
            return (
              <button
                key={country.code}
                onClick={() => onCountryChange?.(country.code)}
                className={cn(
                  'relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <span className="text-base">{country.flag}</span>
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

export { CountryTabs, COUNTRIES };
