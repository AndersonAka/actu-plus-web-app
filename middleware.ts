// Middleware Next.js pour la protection des routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuration des routes
const PUBLIC_ROUTES = [
  '/',
  '/articles',
  '/categories',
  '/search',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Routes dynamiques publiques (patterns)
const PUBLIC_DYNAMIC_PATTERNS = [
  /^\/articles\/[^/]+$/,      // /articles/[id]
  /^\/categories\/[^/]+$/,    // /categories/[id]
  /^\/countries\/[^/]+$/,     // /countries/[code]
];

// Routes protégées par rôle (clés en minuscules pour correspondre au backend)
const ROLE_ROUTES = {
  veilleur: /^\/veilleur(\/.*)?$/,
  manager: /^\/moderateur(\/.*)?$/,
  admin: /^\/admin(\/.*)?$/,
};

// Hiérarchie des rôles (en minuscules pour correspondre au backend)
const ROLE_HIERARCHY: Record<string, string[]> = {
  user: [],
  veilleur: ['veilleur'],
  manager: ['veilleur', 'manager'],
  admin: ['veilleur', 'manager', 'admin'],
};

function isPublicRoute(pathname: string): boolean {
  // Vérifier les routes statiques
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Vérifier les patterns dynamiques
  return PUBLIC_DYNAMIC_PATTERNS.some(pattern => pattern.test(pathname));
}

function getUserFromCookie(request: NextRequest): { role: string } | null {
  const userCookie = request.cookies.get('actu-plus-user');
  
  if (!userCookie?.value) {
    return null;
  }
  
  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

function hasAccessToRoute(userRole: string, pathname: string): boolean {
  // Vérifier chaque route protégée par rôle
  for (const [requiredRole, pattern] of Object.entries(ROLE_ROUTES)) {
    if (pattern.test(pathname)) {
      // L'utilisateur doit avoir ce rôle ou un rôle supérieur
      const allowedRoles = ROLE_HIERARCHY[userRole] || [];
      return allowedRoles.includes(requiredRole);
    }
  }
  
  // Route protégée mais pas spécifique à un rôle (ex: /profile, /favorites)
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques : accès libre
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Récupérer l'utilisateur depuis le cookie
  const user = getUserFromCookie(request);
  const accessToken = request.cookies.get('actu-plus-access-token');
  
  // Si pas authentifié, rediriger vers login
  if (!user || !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Vérifier les permissions de rôle
  if (!hasAccessToRoute(user.role, pathname)) {
    // Rediriger vers la page d'accueil ou une page d'erreur 403
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
