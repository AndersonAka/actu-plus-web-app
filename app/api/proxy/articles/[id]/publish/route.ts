import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// POST /api/proxy/articles/[id]/publish - Publier un article validé (Modérateur)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Récupérer le body pour isPremium
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Pas de body, c'est ok
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/${id}/publish`, {
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

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Publish article error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de la publication de l'article" },
      { status: 500 }
    );
  }
}
