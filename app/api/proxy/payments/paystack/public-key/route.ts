import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/payments/paystack/public-key - Récupérer la clé publique Paystack
export async function GET(request: NextRequest) {
  try {
    const url = `${apiConfig.baseUrl}/api/payments/paystack/public-key`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paystack public key error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Get Paystack public key error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors de la récupération de la clé publique' },
      { status: 500 },
    );
  }
}
