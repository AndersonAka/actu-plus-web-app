import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/countries/code/[code] - Récupérer un pays par son code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const url = `${apiConfig.baseUrl}/api/countries/code/${code}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get country by code error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération du pays' },
      { status: 500 },
    );
  }
}
