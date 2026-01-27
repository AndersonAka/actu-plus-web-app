import { NextResponse } from 'next/server';

// Utiliser BACKEND_API_URL (côté serveur) et non NEXT_PUBLIC_API_URL (qui est /api/proxy)
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET() {
  // Facebook utilise FACEBOOK_APP_ID ou FACEBOOK_CLIENT_ID selon la configuration
  const facebookAppId = process.env.FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID;
  const backendUrl = BACKEND_URL;
  
  if (!facebookAppId) {
    return NextResponse.json(
      { error: 'Configuration Facebook OAuth manquante' },
      { status: 500 }
    );
  }

  // Construire l'URL d'autorisation Facebook
  const redirectUri = `${backendUrl}/api/auth/oauth/facebook/callback`;
  const state = encodeURIComponent(JSON.stringify({ platform: 'web' }));
  
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  facebookAuthUrl.searchParams.set('client_id', facebookAppId);
  facebookAuthUrl.searchParams.set('redirect_uri', redirectUri);
  facebookAuthUrl.searchParams.set('scope', 'public_profile,email');
  facebookAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(facebookAuthUrl.toString());
}
