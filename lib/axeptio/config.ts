/**
 * Axeptio — surcharge via NEXT_PUBLIC_AXEPTIO_* ; valeurs par défaut = projet Actu Plus.
 * Désactiver le widget et le script : NEXT_PUBLIC_AXEPTIO_DISABLED=true
 */
const DEFAULT_CLIENT_ID = '6a05aefc5bd81e0c016654d8';
const DEFAULT_COOKIES_VERSION = '2576832e-3492-417a-88eb-52ef306d1de5';

function readEnvTrim(key: string): string | undefined {
  const v = process.env[key];
  if (v == null || v === '') return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
}

export const AXEPTIO_CLIENT_ID =
  readEnvTrim('NEXT_PUBLIC_AXEPTIO_CLIENT_ID') ?? DEFAULT_CLIENT_ID;

export const AXEPTIO_COOKIES_VERSION =
  readEnvTrim('NEXT_PUBLIC_AXEPTIO_COOKIES_VERSION') ?? DEFAULT_COOKIES_VERSION;

export function isAxeptioEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AXEPTIO_DISABLED !== 'true';
}

export function hasValidAxeptioProjectIds(): boolean {
  return (
    AXEPTIO_CLIENT_ID.length > 8 &&
    !/^empty$/i.test(AXEPTIO_CLIENT_ID) &&
    AXEPTIO_COOKIES_VERSION.length > 8 &&
    !/^empty$/i.test(AXEPTIO_COOKIES_VERSION)
  );
}
