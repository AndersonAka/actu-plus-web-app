import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/articles/status-counts - Répartition de tous les articles par statut (Admin/Manager)
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

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/status-counts`, {
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
    console.error('Get article status counts error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
