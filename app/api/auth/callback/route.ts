import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

// Utiliser BACKEND_API_URL (côté serveur) et non NEXT_PUBLIC_API_URL (qui est /api/proxy)
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const error = searchParams.get('error');

  // Si erreur, rediriger vers login avec le message d'erreur
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
  }

  // Vérifier que les tokens sont présents
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/login?error=Tokens manquants', request.url));
  }

  try {
    // Récupérer les informations utilisateur depuis le backend
    const userResponse = await fetch(`${BACKEND_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Impossible de récupérer les informations utilisateur');
    }

    const user = await userResponse.json();

    // Stocker les tokens dans les cookies
    const cookieStore = await cookies();
    
    // Access token (httpOnly pour la sécurité)
    cookieStore.set(authConfig.cookies.accessToken, accessToken, {
      ...authConfig.accessTokenCookieOptions,
      httpOnly: true,
    });

    // Refresh token (httpOnly pour la sécurité)
    cookieStore.set(authConfig.cookies.refreshToken, refreshToken, {
      ...authConfig.cookieOptions,
      httpOnly: true,
    });

    // User data (accessible côté client pour l'affichage)
    cookieStore.set(authConfig.cookies.user, JSON.stringify(user), {
      ...authConfig.cookieOptions,
      httpOnly: false, // Accessible côté client
    });

    // Rediriger vers la page d'accueil ou le dashboard selon le rôle
    const redirectUrl = getRedirectUrlByRole(user.role);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('Erreur lors du callback OAuth:', error);
    return NextResponse.redirect(new URL('/login?error=Erreur lors de la connexion', request.url));
  }
}

function getRedirectUrlByRole(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
      return '/moderateur';
    case 'VEILLEUR':
      return '/veilleur';
    default:
      return '/';
  }
}
