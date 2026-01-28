'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  countryCode?: string;
  countryName?: string;
}

export function BackButton({ countryCode, countryName }: BackButtonProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Check if we came from a country page
  const fromCountry = searchParams.get('from');
  
  // Determine the back URL and label
  const getBackInfo = () => {
    if (fromCountry) {
      return {
        href: `/country/${fromCountry}`,
        label: `Retour à ${countryName || fromCountry.toUpperCase()}`,
      };
    }
    
    // If article has a country, offer to go there
    if (countryCode) {
      return {
        href: `/country/${countryCode}`,
        label: `Voir ${countryName || 'le pays'}`,
        secondary: true,
      };
    }
    
    return {
      href: '/articles',
      label: 'Retour aux articles',
    };
  };

  const backInfo = getBackInfo();

  const handleBack = () => {
    // If we have browser history and came from the site, use back()
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push(backInfo.href);
    }
  };

  return (
    <div className="mb-6 flex items-center gap-4">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {fromCountry ? backInfo.label : 'Retour'}
      </button>
      
      {/* Secondary link to country if not coming from there */}
      {!fromCountry && countryCode && (
        <Link
          href={`/country/${countryCode}`}
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          <span className="text-base">{countryName ? '→' : ''}</span>
          {countryName || countryCode.toUpperCase()}
        </Link>
      )}
    </div>
  );
}
