/**
 * Types pour la gestion des cookies et du consentement RGPD
 */

export type CookieCategory = 
  | 'necessary'      // Requis - toujours actif
  | 'functional'     // Préférences utilisateur
  | 'analytics'      // Statistiques et performance
  | 'marketing'      // Publicités ciblées
  | 'personalization'; // Recommandations contenu

export interface CookieCategoryInfo {
  id: CookieCategory;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieInfo[];
}

export interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
}

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

export const COOKIE_CATEGORIES: CookieCategoryInfo[] = [
  {
    id: 'necessary',
    name: 'Cookies essentiels',
    description: 'Ces cookies sont nécessaires au fonctionnement du site. Ils permettent l\'authentification, la sécurité et les fonctionnalités de base. Ils ne peuvent pas être désactivés.',
    required: true,
    cookies: [
      { name: 'auth_token', provider: 'Actu Plus', purpose: 'Authentification utilisateur', expiry: '7 jours' },
      { name: 'refresh_token', provider: 'Actu Plus', purpose: 'Renouvellement de session', expiry: '30 jours' },
      { name: 'cookie_consent', provider: 'Actu Plus', purpose: 'Mémorisation des préférences cookies', expiry: '1 an' },
    ],
  },
  {
    id: 'functional',
    name: 'Cookies fonctionnels',
    description: 'Ces cookies permettent de mémoriser vos préférences (langue, thème, région) pour personnaliser votre expérience.',
    required: false,
    cookies: [
      { name: 'user_preferences', provider: 'Actu Plus', purpose: 'Préférences utilisateur', expiry: '1 an' },
      { name: 'selected_country', provider: 'Actu Plus', purpose: 'Pays sélectionné', expiry: '30 jours' },
    ],
  },
  {
    id: 'analytics',
    name: 'Cookies analytiques',
    description: 'Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site, pour améliorer nos services et contenus.',
    required: false,
    cookies: [
      { name: '_ga', provider: 'Google Analytics', purpose: 'Statistiques de visite', expiry: '2 ans' },
      { name: '_gid', provider: 'Google Analytics', purpose: 'Identification visiteur', expiry: '24 heures' },
    ],
  },
  {
    id: 'marketing',
    name: 'Cookies publicitaires',
    description: 'Ces cookies sont utilisés pour afficher des publicités pertinentes et mesurer l\'efficacité des campagnes publicitaires.',
    required: false,
    cookies: [
      { name: 'ads_id', provider: 'Partenaires publicitaires', purpose: 'Ciblage publicitaire', expiry: '90 jours' },
    ],
  },
  {
    id: 'personalization',
    name: 'Cookies de personnalisation',
    description: 'Ces cookies permettent de vous proposer des contenus et recommandations adaptés à vos centres d\'intérêt.',
    required: false,
    cookies: [
      { name: 'reading_history', provider: 'Actu Plus', purpose: 'Historique de lecture', expiry: '6 mois' },
      { name: 'recommended_topics', provider: 'Actu Plus', purpose: 'Sujets recommandés', expiry: '30 jours' },
    ],
  },
];
