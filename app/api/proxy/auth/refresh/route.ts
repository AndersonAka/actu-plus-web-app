import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';
import { refreshBackendSessionCookies } from '@/lib/api/backendSession';

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(authConfig.cookies.refreshToken)?.value;

    if (!refreshToken?.trim()) {
      return NextResponse.json({ message: 'Pas de refresh token' }, { status: 401 });
    }

    const result = await refreshBackendSessionCookies(cookieStore);

    if (!result) {
      cookieStore.delete(authConfig.cookies.accessToken);
      cookieStore.delete(authConfig.cookies.refreshToken);
      cookieStore.delete(authConfig.cookies.user);
      return NextResponse.json({ message: 'Refresh token invalide ou expiré' }, { status: 401 });
    }

    return NextResponse.json({
      user: result.user,
      message: 'Token rafraîchi',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors du rafraîchissement';
    console.error('Refresh token error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
