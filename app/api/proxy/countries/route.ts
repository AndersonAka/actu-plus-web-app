import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/countries - Liste des pays
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Pas de cache pour avoir les données à jour
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get countries error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des pays' },
      { status: 500 }
    );
  }
}

// POST /api/proxy/countries - Créer un pays (Admin)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${apiConfig.baseUrl}/api/countries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    // Vérifier si la réponse a du contenu
    const text = await response.text();
    const data = text ? JSON.parse(text) : { success: true };

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Create country error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la création du pays' },
      { status: 500 }
    );
  }
}
