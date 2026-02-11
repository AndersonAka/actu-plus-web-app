import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth/config';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!token) {
      return NextResponse.json(
        { isFavorited: false },
        { status: 200 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/favorites/check/${articleId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ isFavorited: false }, { status: 200 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json({ isFavorited: false }, { status: 200 });
  }
}
