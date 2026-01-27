import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/subscriptions/active - Vérifier si l'utilisateur a un abonnement actif
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { hasActiveSubscription: false },
        { status: 200 }
      );
    }

    const response = await fetch(`${apiConfig.baseUrl}/api/subscriptions/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Si l'endpoint n'existe pas ou erreur, considérer pas d'abonnement
      return NextResponse.json({ hasActiveSubscription: false });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Check subscription error:', error);
    return NextResponse.json({ hasActiveSubscription: false });
  }
}
