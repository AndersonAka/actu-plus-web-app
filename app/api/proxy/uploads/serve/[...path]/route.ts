import { NextRequest, NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

// GET /api/proxy/uploads/serve/[...path] - Proxy pour servir les images du backend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imagePath = path.join('/');
    
    const response = await fetch(`${apiConfig.baseUrl}/uploads/${imagePath}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Image non trouvée' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Serve image error:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur lors du chargement de l\'image' },
      { status: 500 }
    );
  }
}
