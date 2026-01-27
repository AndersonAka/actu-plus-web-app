// Configuration de l'authentification custom
export const authConfig = {
  // Noms des cookies
  cookies: {
    accessToken: 'actu-plus-access-token',
    refreshToken: 'actu-plus-refresh-token',
    user: 'actu-plus-user',
  },
  
  // Options des cookies
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  },
  
  // Options pour le cookie access token (plus court)
  accessTokenCookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60, // 1 heure
  },
  
  // Routes publiques (pas besoin d'authentification)
  publicRoutes: [
    '/',
    '/articles',
    '/articles/:id',
    '/categories',
    '/categories/:id',
    '/countries/:code',
    '/search',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
  
  // Routes par rôle
  roleRoutes: {
    VEILLEUR: ['/veilleur', '/veilleur/:path*'],
    MODERATEUR: ['/moderateur', '/moderateur/:path*'],
    ADMIN: ['/admin', '/admin/:path*'],
  },
} as const;
