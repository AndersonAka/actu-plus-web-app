import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/auth/me`, {
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

    // Mettre à jour le cookie user avec les données fraîches
    cookieStore.set(authConfig.cookies.user, JSON.stringify(data), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}
