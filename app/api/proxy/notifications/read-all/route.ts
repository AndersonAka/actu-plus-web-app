import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// PUT /api/proxy/notifications/read-all - Mark all notifications as read
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/notifications/read-all`, {
      method: 'PUT',
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
        { message: 'Erreur lors du marquage des notifications' },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
