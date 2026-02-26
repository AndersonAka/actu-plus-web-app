import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// DELETE /api/proxy/users/me - Supprimer son propre compte
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Supprimer tous les cookies de session
    cookieStore.delete(authConfig.cookies.accessToken);
    cookieStore.delete(authConfig.cookies.refreshToken);
    cookieStore.delete(authConfig.cookies.user);

    return NextResponse.json({ message: 'Compte supprimé avec succès' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la suppression du compte' },
      { status: 500 }
    );
  }
}
