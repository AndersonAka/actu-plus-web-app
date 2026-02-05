import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// PATCH /api/proxy/notifications/[id]/read - Mark notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;

    const response = await fetch(`${apiConfig.baseUrl}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.ok) {
      return NextResponse.json({ success: true });
    }

    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { message: 'Erreur lors du marquage de la notification' },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
