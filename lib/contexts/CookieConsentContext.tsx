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
  showBanner: boolean;
  showSettings: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  updatePreference: (category: CookieCategory, value: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  closeBanner: () => void;
  resetConsent: () => void;
  hasConsent: (category: CookieCategory) => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const getStoredConsent = (): CookieConsentState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
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
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setState(stored);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
    setIsLoading(false);
  }, []);

  const saveState = useCallback((newState: CookieConsentState) => {
    setState(newState);
    storeConsent(newState);
    setShowBanner(false);
    setShowSettings(false);
  }, []);

  const acceptAll = useCallback(() => {
    const newState: CookieConsentState = {
      hasConsented: true,
      consentDate: new Date().toISOString(),
      preferences: {
        necessary: true,
        functional: true,
        analytics: true,
        marketing: true,
        personalization: true,
      },
    };
    saveState(newState);
  }, [saveState]);

  const rejectAll = useCallback(() => {
    const newState: CookieConsentState = {
      hasConsented: true,
      consentDate: new Date().toISOString(),
      preferences: {
        necessary: true, // Toujours requis
        functional: false,
        analytics: false,
        marketing: false,
        personalization: false,
      },
    };
    saveState(newState);
  }, [saveState]);

  const savePreferences = useCallback((preferences: CookiePreferences) => {
    const newState: CookieConsentState = {
      hasConsented: true,
      consentDate: new Date().toISOString(),
      preferences: {
        ...preferences,
        necessary: true, // Force toujours true
      },
    };
    saveState(newState);
  }, [saveState]);

  const updatePreference = useCallback((category: CookieCategory, value: boolean) => {
    if (category === 'necessary') return; // Cannot change necessary
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: value,
      },
    }));
  }, []);

  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const closeBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  const resetConsent = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState({
      hasConsented: false,
      consentDate: null,
      preferences: DEFAULT_PREFERENCES,
    });
    setShowBanner(true);
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
        showBanner,
        showSettings,
        acceptAll,
        rejectAll,
        savePreferences,
        updatePreference,
        openSettings,
        closeSettings,
        closeBanner,
        resetConsent,
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
