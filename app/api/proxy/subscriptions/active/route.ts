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

    // Le backend expose GET /api/subscriptions/me qui retourne l'abonnement actif ou null
    const response = await fetch(`${apiConfig.baseUrl}/api/subscriptions/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Si l'endpoint retourne une erreur, considérer pas d'abonnement
      return NextResponse.json({ hasActiveSubscription: false, subscription: null });
    }

    const data = await response.json();
    
    // Le backend peut retourner { success, data: subscription } ou directement l'objet subscription
    const subscription = data?.data || data;
    const hasActiveSubscription = subscription !== null && subscription?.status === 'active';
    return NextResponse.json({ 
      hasActiveSubscription, 
      subscription,
    });
  } catch (error: any) {
    console.error('Check subscription error:', error);
    return NextResponse.json({ hasActiveSubscription: false });
  }
}
