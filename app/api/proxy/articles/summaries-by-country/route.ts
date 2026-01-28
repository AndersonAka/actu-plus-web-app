import { NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/articles/summaries-by-country - Récupérer les résumés par pays
export async function GET() {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/articles/summaries-by-country`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Fetch summaries by country error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des résumés' },
      { status: 500 }
    );
  }
}
