import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// DELETE /api/proxy/subscriptions/:id - Supprimer un abonnement en attente (Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/subscriptions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const rawText = await response.text();
    let data: any = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText };
      }
    }

    if (!response.ok) {
      return NextResponse.json(data || { message: 'Erreur lors de la suppression' }, { status: response.status });
    }

    return NextResponse.json(data || { success: true });
  } catch (error: any) {
    console.error('Delete subscription error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la suppression de l\'abonnement' },
      { status: 500 },
    );
  }
}
