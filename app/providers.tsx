'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { CookieConsentProvider } from '@/lib/contexts/CookieConsentContext';
import { CookieBanner, CookieSettingsModal, AxeptioIntegration } from '@/components/organisms';
import { isAxeptioEnabled } from '@/lib/axeptio/config';

export function Providers({ children }: { children: ReactNode }) {
  const axeptio = isAxeptioEnabled();

  return (
    <ToastProvider>
      <CookieConsentProvider>
        {children}
        {axeptio && <AxeptioIntegration />}
        {!axeptio && (
          <>
            <CookieBanner />
            <CookieSettingsModal />
          </>
        )}
      </CookieConsentProvider>
    </ToastProvider>
  );
}
