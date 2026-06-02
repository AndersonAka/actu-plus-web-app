import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';
import { unwrapApiData } from '@/lib/api/unwrap';

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
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

    cookieStore.set(authConfig.cookies.user, JSON.stringify(user), {
      ...authConfig.cookieOptions,
      httpOnly: false,
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération du profil';
    console.error('Get me error:', error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
