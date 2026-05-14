/**
 * Types pour la gestion des cookies et du consentement RGPD
 */

export type CookieCategory = 
  | 'necessary'      // Requis - toujours actif
  | 'functional'     // Préférences utilisateur
  | 'analytics'      // Statistiques et performance
  | 'marketing'      // Publicités ciblées
  | 'personalization'; // Recommandations contenu

export interface CookiePreferences {
  necessary: boolean;      // Toujours true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface CookieConsentState {
  hasConsented: boolean;
  consentDate: string | null;
  preferences: CookiePreferences;
}

export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
  personalization: false,
};
