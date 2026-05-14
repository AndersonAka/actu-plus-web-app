'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { CookieConsentProvider } from '@/lib/contexts/CookieConsentContext';
import { AxeptioIntegration } from '@/components/organisms';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CookieConsentProvider>
        {children}
        <AxeptioIntegration />
      </CookieConsentProvider>
    </ToastProvider>
  );
}
