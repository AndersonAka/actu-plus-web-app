import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    // Appeler le backend pour invalider le token (optionnel)
    if (accessToken) {
      try {
        await fetch(`${apiConfig.baseUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch {
        // Ignorer les erreurs du backend
      }
    }

    // Supprimer les cookies
    cookieStore.delete(authConfig.cookies.accessToken);
    cookieStore.delete(authConfig.cookies.refreshToken);
    cookieStore.delete(authConfig.cookies.user);

    return NextResponse.json({ message: 'Déconnexion réussie' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
