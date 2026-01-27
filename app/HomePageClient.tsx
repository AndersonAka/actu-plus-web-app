'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CountryTabs, CountryCode } from '@/components/molecules';

export function HomePageClient() {
  const router = useRouter();
  const [activeCountry, setActiveCountry] = useState<CountryCode | undefined>(undefined);

  const handleCountryChange = (country: CountryCode) => {
    setActiveCountry(country);
    router.push(`/country/${country}`);
  };

  return (
    <CountryTabs
      activeCountry={activeCountry}
      onCountryChange={handleCountryChange}
    />
  );
};
