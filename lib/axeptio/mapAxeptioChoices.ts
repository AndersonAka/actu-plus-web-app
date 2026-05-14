import type { CookiePreferences } from '@/lib/types/cookie.types';
import { DEFAULT_PREFERENCES } from '@/lib/types/cookie.types';

/**
 * Mappe les clés vendors Axeptio (cookies:complete) vers nos catégories internes.
 * Les libellés exacts dépendent de la configuration Axeptio ; on couvre des motifs courants.
 */
export function mapAxeptioChoicesToPreferences(
  choices: Record<string, boolean>
): CookiePreferences {
  const prefs: CookiePreferences = { ...DEFAULT_PREFERENCES, necessary: true };
  let anyGranted = false;

  for (const [rawKey, granted] of Object.entries(choices)) {
    if (!granted) continue;
    anyGranted = true;
    const key = rawKey.toLowerCase().replace(/[\s_-]+/g, '');

    if (
      key.includes('analytics') ||
      key.includes('googleanalytics') ||
      key.includes('ga4') ||
      key.includes('gtag') ||
      key.includes('matomo') ||
      key.includes('plausible') ||
      key.includes('hotjar') ||
      key.includes('clarity')
    ) {
      prefs.analytics = true;
      continue;
    }

    if (
      key.includes('marketing') ||
      key.includes('advertising') ||
      key.includes('ads') ||
      key.includes('facebook') ||
      key.includes('meta') ||
      key.includes('doubleclick') ||
      key.includes('criteo') ||
      key.includes('linkedin') ||
      key.includes('tiktok') ||
      key.includes('twitter') ||
      key.includes('xads')
    ) {
      prefs.marketing = true;
      continue;
    }

    if (
      key.includes('personalization') ||
      key.includes('personalisation') ||
      key.includes('recommendation') ||
      key.includes('contentpersonalization')
    ) {
      prefs.personalization = true;
      continue;
    }

    if (
      key.includes('functional') ||
      key.includes('preference') ||
      key.includes('vimeo') ||
      key.includes('youtube') ||
      key.includes('intercom') ||
      key.includes('crisp') ||
      key.includes('chat') ||
      key.includes('recaptcha')
    ) {
      prefs.functional = true;
      continue;
    }
  }

  if (anyGranted && !prefs.analytics && !prefs.marketing && !prefs.functional && !prefs.personalization) {
    prefs.functional = true;
  }

  return prefs;
}
