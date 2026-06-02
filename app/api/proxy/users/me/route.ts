import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';
import { unwrapApiData } from '@/lib/api/unwrap';

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(authConfig.cookies.accessToken)?.value;
}

// GET /api/proxy/users/me — Profil utilisateur
export async function GET() {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const user = unwrapApiData(data);

    const cookieStore = await cookies();
    cookieStore.set(authConfig.cookies.user, JSON.stringify(user), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération du profil';
    console.error('Get profile error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/proxy/users/me — Mise à jour du profil
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const user = unwrapApiData(data);

    const cookieStore = await cookies();
    cookieStore.set(authConfig.cookies.user, JSON.stringify(user), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil';
    console.error('Update profile error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/proxy/users/me — Supprimer son propre compte
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

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

    const cookieStore = await cookies();
    cookieStore.delete(authConfig.cookies.accessToken);
    cookieStore.delete(authConfig.cookies.refreshToken);
    cookieStore.delete(authConfig.cookies.user);

    return NextResponse.json({ message: 'Compte supprimé avec succès' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression du compte';
    console.error('Delete account error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
