import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/articles - Liste des articles
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${apiConfig.baseUrl}/api/articles${queryString ? `?${queryString}` : ''}`;

    console.log('[Proxy Articles] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable cache for fresh data
    });

    const data = await response.json();

    console.log('[Proxy Articles] Response status:', response.status, 'Data keys:', Object.keys(data));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Proxy Articles] Error:', error.message, 'URL:', `${apiConfig.baseUrl}/api/articles`);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

// POST /api/proxy/articles - Créer un article (Veilleur+)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/articles`, {
      method: 'POST',
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

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Create article error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de la création de l'article" },
      { status: 500 }
    );
  }
}
