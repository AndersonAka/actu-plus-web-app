import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/articles/admin - Liste des articles (Admin/Manager) incluant non publiés
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${apiConfig.baseUrl}/api/articles/admin${queryString ? `?${queryString}` : ''}`;

    console.log('[proxy/articles/admin] Calling:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    console.log('[proxy/articles/admin] Response status:', response.status, 'data:', JSON.stringify(data).slice(0, 200));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[proxy/articles/admin] Error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des articles (admin)' },
      { status: 500 },
    );
  }
}
