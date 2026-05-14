import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';
import { normalizeBearerToken, refreshBackendSessionCookies } from '@/lib/api/backendSession';

/**
 * POST /api/proxy/onesignal/email
 * Relaie vers le backend Nest : POST /api/onesignal/email (e-mail transactionnel via Brevo, admin).
 * En cas de 401 (souvent access token expiré), tente un refresh puis une seconde requête.
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    let accessToken = normalizeBearerToken(cookieStore.get(authConfig.cookies.accessToken)?.value);

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();

    const forward = (token: string) =>
      fetch(`${apiConfig.baseUrl}/api/onesignal/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

    let response = await forward(accessToken);

    if (response.status === 401) {
      const refreshed = await refreshBackendSessionCookies(cookieStore);
      if (refreshed) {
        response = await forward(refreshed.accessToken);
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('OneSignal email proxy error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
