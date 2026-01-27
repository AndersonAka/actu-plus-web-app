import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// GET /api/proxy/subscriptions/stats - Récupérer les stats des abonnements
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json({ active: 0, expired: 0, pending: 0, total: 0 });
    }

    const extractTotal = (payload: any): number => {
      const p = payload?.data ?? payload;
      const total = p?.total ?? p?.data?.total;
      return typeof total === 'number' ? total : 0;
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    const [activeRes, expiredRes, pendingRes] = await Promise.all([
      fetch(`${apiConfig.baseUrl}/api/subscriptions?status=active&limit=1`, {
        method: 'GET',
        headers,
      }),
      fetch(`${apiConfig.baseUrl}/api/subscriptions?status=expired&limit=1`, {
        method: 'GET',
        headers,
      }),
      fetch(`${apiConfig.baseUrl}/api/subscriptions?status=pending&limit=1`, {
        method: 'GET',
        headers,
      }),
    ]);

    const activeData = activeRes.ok ? await activeRes.json() : null;
    const expiredData = expiredRes.ok ? await expiredRes.json() : null;
    const pendingData = pendingRes.ok ? await pendingRes.json() : null;

    const active = extractTotal(activeData);
    const expired = extractTotal(expiredData);
    const pending = extractTotal(pendingData);

    return NextResponse.json({
      active,
      expired,
      pending,
      total: active + expired + pending,
    });
  } catch (error: any) {
    console.error('Subscription stats error:', error);
    return NextResponse.json({ active: 0, expired: 0, pending: 0, total: 0 });
  }
}
