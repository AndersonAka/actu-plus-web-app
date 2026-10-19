import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookies.accessToken)?.value;

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${BACKEND_URL}/api/articles/${id}/ratings/summary`,
      {
        headers,
        cache: 'no-store',
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    );
  }
}
