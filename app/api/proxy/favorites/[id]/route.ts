import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId: id }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout aux favoris' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/favorites/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return NextResponse.json({ success: true });
    }

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression des favoris' },
      { status: 500 }
    );
  }
}
