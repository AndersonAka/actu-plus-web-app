'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { CookieConsentProvider } from '@/lib/contexts/CookieConsentContext';
import { CookieBanner, CookieSettingsModal } from '@/components/organisms';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CookieConsentProvider>
        {children}
        <CookieBanner />
        <CookieSettingsModal />
      </CookieConsentProvider>
    </ToastProvider>
  );
}
