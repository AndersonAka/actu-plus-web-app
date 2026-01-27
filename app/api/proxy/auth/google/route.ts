import { NextResponse } from 'next/server';

// Utiliser BACKEND_API_URL (côté serveur) et non NEXT_PUBLIC_API_URL (qui est /api/proxy)
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET() {
  // Récupérer les variables d'environnement côté serveur
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const backendUrl = BACKEND_URL;
  
  if (!googleClientId) {
    return NextResponse.json(
      { error: 'Configuration Google OAuth manquante' },
      { status: 500 }
    );
  }

  // Construire l'URL d'autorisation Google
  const redirectUri = `${backendUrl}/api/auth/oauth/google/callback`;
  const scope = encodeURIComponent('openid profile email');
  const state = encodeURIComponent(JSON.stringify({ platform: 'web' }));
  
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', googleClientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid profile email');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');
  googleAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
