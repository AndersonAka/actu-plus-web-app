'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CountryItem {
  id: string;
  name: string;
  code: string;
}

export function HomeCountrySwitcher() {
  const router = useRouter();
  const [countries, setCountries] = useState<CountryItem[]>([]);

  useEffect(() => {
    fetch('/api/proxy/countries')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json) return;
        const list = json.data || json;
        setCountries(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  if (countries.length === 0) return null;

  return (
    <div className="flex items-center">
      <span className="mr-3.5 text-[11px] font-semibold uppercase tracking-widest text-[#605d5d]">Pays</span>
      <div className="flex items-stretch border-l border-[var(--public-divider)]">
        {countries.map((country) => (
          <button
            key={country.id}
            type="button"
            onClick={() => router.push(`/country/${country.code.toLowerCase()}`)}
            className="flex items-center border-r border-[var(--public-divider)] px-3.5 text-[13px] font-extrabold text-[#201e1d] transition-colors hover:bg-gray-50"
          >
            {country.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
