import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';
import { cookies } from 'next/headers';

// GET /api/proxy/articles/stats - Statistiques agrégées des articles (Admin/Manager)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get article stats error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
