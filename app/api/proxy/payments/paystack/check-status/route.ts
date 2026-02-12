import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// POST /api/proxy/payments/paystack/check-status - Vérifier le statut d'un paiement Paystack
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const url = `${apiConfig.baseUrl}/api/payments/paystack/check-status`;

    console.log('Checking Paystack payment status:', body.paymentId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paystack check status error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Check Paystack status error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la vérification du statut' },
      { status: 500 },
    );
  }
}
