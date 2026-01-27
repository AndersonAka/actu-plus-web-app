import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/articles/[id] - Détail d'un article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get article error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de la récupération de l'article" },
      { status: 500 }
    );
  }
}

// PATCH /api/proxy/articles/[id] - Modifier un article (Veilleur+ pour ses articles)
export async function PATCH(
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
    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/${id}`, {
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

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update article error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de la modification de l'article" },
      { status: 500 }
    );
  }
}

// DELETE /api/proxy/articles/[id] - Supprimer un article (Admin)
export async function DELETE(
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

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ message: 'Article supprimé' });
  } catch (error: any) {
    console.error('Delete article error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de la suppression de l'article" },
      { status: 500 }
    );
  }
}
