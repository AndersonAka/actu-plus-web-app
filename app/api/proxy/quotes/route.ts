import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';
import { forwardedHeaders } from '@/lib/utils/forwarded-headers';

// POST /api/proxy/quotes - Soumettre une demande de cotation (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...forwardedHeaders(request),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Create quote error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de l'envoi de la demande" },
      { status: 500 },
    );
  }
}

// GET /api/proxy/quotes - Liste des demandes de cotation (Admin)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const search = request.nextUrl.search || '';

    const response = await fetch(`${apiConfig.baseUrl}/api/quotes${search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get quotes error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération' },
      { status: 500 },
    );
  }
}
