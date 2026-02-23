import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// PATCH /api/proxy/countries/[id] - Modifier un pays
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
    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/countries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Update country error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la modification du pays' },
      { status: 500 }
    );
  }
}

// DELETE /api/proxy/countries/[id] - Supprimer un pays
export async function DELETE(
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

    const response = await fetch(`${apiConfig.baseUrl}/api/countries/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle empty response (204 No Content)
    if (response.status === 204 || response.ok) {
      return NextResponse.json({ success: true, message: 'Pays supprimé' });
    }

    // Try to parse error response
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { message: 'Erreur lors de la suppression' },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Delete country error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la suppression du pays' },
      { status: 500 }
    );
  }
}
