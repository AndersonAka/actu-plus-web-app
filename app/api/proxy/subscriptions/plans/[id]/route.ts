import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(authConfig.cookies.accessToken)?.value;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const accessToken = await getToken();
    if (!accessToken) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const response = await fetch(`${apiConfig.baseUrl}/api/subscriptions/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json(data, { status: response.status });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const accessToken = await getToken();
    if (!accessToken) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const response = await fetch(`${apiConfig.baseUrl}/api/subscriptions/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 204 || response.ok) {
      return NextResponse.json({ success: true });
    }
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json({ message: 'Erreur lors de la suppression' }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erreur' }, { status: 500 });
  }
}
