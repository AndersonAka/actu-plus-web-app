import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/categories - Liste des catégories
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/api/categories`, {
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
    console.error('Get categories error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}
