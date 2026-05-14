'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CookiePreferences,
  CookieConsentState,
  CookieCategory,
  DEFAULT_PREFERENCES,
} from '@/lib/types/cookie.types';

const STORAGE_KEY = 'actu_plus_cookie_consent';

interface CookieConsentContextType {
  state: CookieConsentState;
  isLoading: boolean;
  savePreferences: (preferences: CookiePreferences) => void;
  openSettings: () => void;
  hasConsent: (category: CookieCategory) => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const getStoredConsent = (): CookieConsentState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CookieConsentState;
    }
  } catch (error) {
    console.error('Error reading cookie consent:', error);
  }
  return null;
};

const storeConsent = (state: CookieConsentState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error storing cookie consent:', error);
  }
};

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CookieConsentState>({
    hasConsented: false,
    consentDate: null,
    preferences: DEFAULT_PREFERENCES,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setState(stored);
    }
    setIsLoading(false);
  }, []);

  const savePreferences = useCallback((preferences: CookiePreferences) => {
    const newState: CookieConsentState = {
      hasConsented: true,
      consentDate: new Date().toISOString(),
      preferences: {
        ...preferences,
        necessary: true,
      },
    };
    setState(newState);
    storeConsent(newState);
  }, []);

  const openSettings = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.openAxeptioCookies === 'function') {
      window.openAxeptioCookies();
      return;
    }
    void 0 === window._axcb && (window._axcb = []);
    window._axcb.push((axeptio) => {
      axeptio.openCookies?.();
    });
  }, []);

  const hasConsent = useCallback((category: CookieCategory): boolean => {
    if (category === 'necessary') return true;
    return state.hasConsented && state.preferences[category];
  }, [state]);

  return (
    <CookieConsentContext.Provider
      value={{
        state,
        isLoading,
        savePreferences,
        openSettings,
        hasConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
