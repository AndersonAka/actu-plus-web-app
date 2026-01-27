import { NextResponse } from 'next/server';

// Utiliser BACKEND_API_URL (côté serveur) et non NEXT_PUBLIC_API_URL (qui est /api/proxy)
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET() {
  const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
  const backendUrl = BACKEND_URL;
  
  if (!linkedInClientId) {
    return NextResponse.json(
      { error: 'Configuration LinkedIn OAuth manquante' },
      { status: 500 }
    );
  }

  // Construire l'URL d'autorisation LinkedIn
  const redirectUri = `${backendUrl}/api/auth/oauth/linkedin/callback`;
  const state = encodeURIComponent(JSON.stringify({ platform: 'web' }));
  
  const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  linkedInAuthUrl.searchParams.set('client_id', linkedInClientId);
  linkedInAuthUrl.searchParams.set('redirect_uri', redirectUri);
  linkedInAuthUrl.searchParams.set('response_type', 'code');
  linkedInAuthUrl.searchParams.set('scope', 'openid profile email');
  linkedInAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(linkedInAuthUrl.toString());
}
