import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// GET /api/proxy/favorites/most-favorited - Articles les plus mis en favoris
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const response = await fetch(
      `${BACKEND_URL}/api/favorites/most-favorited?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching most favorited:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des articles favoris' },
      { status: 500 }
    );
  }
}
