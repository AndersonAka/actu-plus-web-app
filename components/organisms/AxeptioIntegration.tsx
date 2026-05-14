'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '@/lib/contexts/CookieConsentContext';
import {
  AXEPTIO_CLIENT_ID,
  AXEPTIO_COOKIES_VERSION,
  isAxeptioEnabled,
} from '@/lib/axeptio/config';
import { mapAxeptioChoicesToPreferences } from '@/lib/axeptio/mapAxeptioChoices';

/**
 * Charge le SDK Axeptio (pied de page), Google Consent Mode par défaut « denied »,
 * et synchronise `cookies:complete` avec le stockage interne des préférences.
 */
export function AxeptioIntegration() {
  const { savePreferences } = useCookieConsent();

  useEffect(() => {
    if (!isAxeptioEnabled() || typeof window === 'undefined') return;

    if (window.__axeptioActuPlusInit) return;
    window.__axeptioActuPlusInit = true;

    window.axeptioSettings = {
      clientId: AXEPTIO_CLIENT_ID,
      cookiesVersion: AXEPTIO_COOKIES_VERSION,
      googleConsentMode: {
        default: {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500,
        },
      },
    };

    void 0 === window._axcb && (window._axcb = []);
    window._axcb.push((axeptio) => {
      axeptio.on('cookies:complete', (choices) => {
        const preferences = mapAxeptioChoicesToPreferences(choices);
        savePreferences(preferences);
      });
    });

    if (document.querySelector('script[data-actu-plus-axeptio-sdk]')) return;

    const first = document.getElementsByTagName('script')[0];
    const e = document.createElement('script');
    e.async = true;
    e.src = 'https://static.axept.io/sdk.js';
    e.dataset.actuPlusAxeptioSdk = 'true';
    first?.parentNode?.insertBefore(e, first);
  }, [savePreferences]);

  return null;
}
