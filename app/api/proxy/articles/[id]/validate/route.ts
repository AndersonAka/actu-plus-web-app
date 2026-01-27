import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// POST /api/proxy/articles/[id]/validate - Valider ou rejeter un article (Modérateur)
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
    const body = await request.json();

    // body doit contenir: { action: 'approve' | 'reject', rejectionReason?: string }
    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        { message: "Action invalide. Utilisez 'approve' ou 'reject'" },
        { status: 400 }
      );
    }

    if (body.action === 'reject' && !body.rejectionReason) {
      return NextResponse.json(
        { message: 'La raison du rejet est obligatoire' },
        { status: 400 }
      );
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/articles/${id}/validate`, {
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
    console.error('Validate article error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de la validation de l'article" },
      { status: 500 }
    );
  }
}
