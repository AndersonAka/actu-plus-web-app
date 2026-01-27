import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(authConfig.cookies.refreshToken)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Pas de refresh token' },
        { status: 401 }
      );
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Si le refresh échoue, supprimer les cookies
      cookieStore.delete(authConfig.cookies.accessToken);
      cookieStore.delete(authConfig.cookies.refreshToken);
      cookieStore.delete(authConfig.cookies.user);

      return NextResponse.json(data, { status: response.status });
    }

    // Mettre à jour les cookies
    cookieStore.set(
      authConfig.cookies.accessToken,
      data.tokens.accessToken,
      authConfig.accessTokenCookieOptions
    );

    cookieStore.set(
      authConfig.cookies.refreshToken,
      data.tokens.refreshToken,
      authConfig.cookieOptions
    );

    cookieStore.set(authConfig.cookies.user, JSON.stringify(data.user), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });

    return NextResponse.json({
      user: data.user,
      message: 'Token rafraîchi',
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors du rafraîchissement' },
      { status: 500 }
    );
  }
}
