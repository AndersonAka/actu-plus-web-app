import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Le backend retourne { success, data: { user, tokens }, timestamp }
    const { user, tokens } = data.data || data;

    // Vérifier que les tokens sont présents dans la réponse
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      console.error('Register error: tokens manquants dans la réponse', data);
      return NextResponse.json(
        { message: 'Erreur lors de l\'inscription: tokens manquants' },
        { status: 500 }
      );
    }

    // Stocker les tokens dans les cookies httpOnly
    const cookieStore = await cookies();

    // Access token
    cookieStore.set(
      authConfig.cookies.accessToken,
      tokens.accessToken,
      authConfig.accessTokenCookieOptions
    );

    // Refresh token
    cookieStore.set(
      authConfig.cookies.refreshToken,
      tokens.refreshToken,
      authConfig.cookieOptions
    );

    // User info (accessible côté client)
    cookieStore.set(authConfig.cookies.user, JSON.stringify(user), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });

    return NextResponse.json({
      user,
      message: 'Inscription réussie',
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
