import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/articles/country/[code]/[section] - Articles par pays et section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; section: string }> }
) {
  try {
    const { code, section } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${apiConfig.baseUrl}/api/articles/country/${code}/${section}${queryString ? `?${queryString}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get country articles error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération des articles' },
      { status: 500 },
    );
  }
}
