import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/countries - Liste des pays
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Cache pendant 5 minutes
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
