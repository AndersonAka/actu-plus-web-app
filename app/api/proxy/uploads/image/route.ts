import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiConfig } from '@/config/api.config';
import { authConfig } from '@/lib/auth/config';

// POST /api/proxy/uploads/image - Upload une image
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${apiConfig.baseUrl}/api/uploads/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Réécrire l'URL pour utiliser le proxy au lieu de localhost:3001
    if (data.data?.url) {
      const originalUrl = data.data.url;
      // Extraire le chemin relatif (ex: /uploads/images/xxx.jpg -> images/xxx.jpg)
      const match = originalUrl.match(/\/uploads\/(.+)$/);
      if (match) {
        data.data.url = `/api/proxy/uploads/serve/${match[1]}`;
      }
    } else if (data.url) {
      const originalUrl = data.url;
      const match = originalUrl.match(/\/uploads\/(.+)$/);
      if (match) {
        data.url = `/api/proxy/uploads/serve/${match[1]}`;
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { message: error.message || "Erreur lors de l'upload de l'image" },
      { status: 500 }
    );
  }
}
