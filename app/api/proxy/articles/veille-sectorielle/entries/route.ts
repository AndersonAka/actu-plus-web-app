import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/articles/veille-sectorielle/entries - Entrées Veille Sectorielle à plat (filtrables secteur/pays)
export async function GET(request: NextRequest) {
  try {
    const queryString = request.nextUrl.searchParams.toString();
    const url = `${apiConfig.baseUrl}/api/articles/veille-sectorielle/entries${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fetch veille sectorielle entries error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération de la veille sectorielle' },
      { status: 500 },
    );
  }
}
