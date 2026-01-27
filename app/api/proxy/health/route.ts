// Route de santé pour tester le proxy API
import { NextResponse } from 'next/server';
import { apiConfig } from '@/config/api.config';

export async function GET() {
  try {
    // Test de connexion au backend
    const response = await fetch(`${apiConfig.baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend non accessible',
          status: response.status 
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Backend accessible',
      backend: apiConfig.baseUrl,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur de connexion au backend',
        error: error.message,
        backend: apiConfig.baseUrl,
      },
      { status: 503 }
    );
  }
}
