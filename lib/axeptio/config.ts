/**
 * Axeptio — identifiants par défaut du projet (surchargeables via NEXT_PUBLIC_*).
 * Désactiver l’intégration : NEXT_PUBLIC_AXEPTIO_DISABLED=true
 */
export const AXEPTIO_CLIENT_ID =
  process.env.NEXT_PUBLIC_AXEPTIO_CLIENT_ID ?? 'empty';

export const AXEPTIO_COOKIES_VERSION =
  process.env.NEXT_PUBLIC_AXEPTIO_COOKIES_VERSION ??
  'empty';

export function isAxeptioEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AXEPTIO_DISABLED !== 'true';
}
