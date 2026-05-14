import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

export type NextReadonlyRequestCookies = Awaited<ReturnType<typeof cookies>>;

/** Retire un éventuel préfixe « Bearer » en trop dans la valeur du cookie. */
export function normalizeBearerToken(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  if (t.toLowerCase().startsWith('bearer ')) {
    return t.slice(7).trim() || undefined;
  }
  return t;
}

/**
 * Appelle POST /api/auth/refresh sur le backend Nest et met à jour les cookies Next.
 * Gère la réponse enveloppée `{ success, data: { user, tokens } }`.
 * @returns les nouveaux jetons appliqués aux cookies, ou null si échec
 */
export async function refreshBackendSessionCookies(
  cookieStore: NextReadonlyRequestCookies,
): Promise<{ accessToken: string; user?: unknown } | null> {
  const refreshToken = normalizeBearerToken(cookieStore.get(authConfig.cookies.refreshToken)?.value);
  if (!refreshToken) return null;

  const response = await fetch(`${apiConfig.baseUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  let json: unknown = {};
  try {
    json = await response.json();
  } catch {
    json = {};
  }

  if (!response.ok) return null;

  const root = json as { data?: { user?: unknown; tokens?: { accessToken?: string; refreshToken?: string } } };
  const payload =
    root.data ?? (json as { user?: unknown; tokens?: { accessToken?: string; refreshToken?: string } });
  const tokens = payload?.tokens;
  if (!tokens?.accessToken) return null;

  const access = normalizeBearerToken(tokens.accessToken) ?? tokens.accessToken;

  cookieStore.set(authConfig.cookies.accessToken, access, authConfig.accessTokenCookieOptions);

  if (tokens.refreshToken) {
    cookieStore.set(
      authConfig.cookies.refreshToken,
      tokens.refreshToken,
      authConfig.cookieOptions,
    );
  }

  const user = payload && 'user' in payload ? payload.user : undefined;
  if (user) {
    cookieStore.set(authConfig.cookies.user, JSON.stringify(user), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });
  }

  return { accessToken: access, user };
}
