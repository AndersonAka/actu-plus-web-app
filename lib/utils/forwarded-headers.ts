import { NextRequest } from 'next/server';

/**
 * Extrait l'IP réelle du client à partir des en-têtes posés par le reverse proxy
 * (Nginx) devant l'application Next.js.
 */
export function getClientIp(request: NextRequest): string | undefined {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    // Premier élément = client d'origine
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return undefined;
}

/**
 * En-têtes à transmettre au backend pour préserver l'IP réelle du client
 * (utile au rate-limiting par IP côté API). Non bloquant : si l'IP est
 * introuvable, on ne pose simplement rien.
 */
export function forwardedHeaders(request: NextRequest): Record<string, string> {
  const ip = getClientIp(request);
  if (!ip) return {};
  return {
    'X-Forwarded-For': ip,
    'X-Real-IP': ip,
  };
}
