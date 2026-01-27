// Gestion des sessions côté serveur
import { cookies } from 'next/headers';
import { authConfig } from './config';
import { User, AuthTokens } from '@/types';

export interface Session {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Récupérer la session depuis les cookies (Server Component)
export async function getSession(): Promise<Session> {
  const cookieStore = await cookies();
  
  const accessToken = cookieStore.get(authConfig.cookies.accessToken)?.value || null;
  const refreshToken = cookieStore.get(authConfig.cookies.refreshToken)?.value || null;
  const userCookie = cookieStore.get(authConfig.cookies.user)?.value;
  
  let user: User | null = null;
  
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }
  
  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken && !!user,
  };
}

// Définir les cookies de session (Server Action)
export async function setSessionCookies(tokens: AuthTokens, user: User): Promise<void> {
  const cookieStore = await cookies();
  
  // Access token (httpOnly, courte durée)
  cookieStore.set(
    authConfig.cookies.accessToken,
    tokens.accessToken,
    authConfig.accessTokenCookieOptions
  );
  
  // Refresh token (httpOnly, longue durée)
  cookieStore.set(
    authConfig.cookies.refreshToken,
    tokens.refreshToken,
    authConfig.cookieOptions
  );
  
  // User info (pour affichage côté client, pas httpOnly)
  cookieStore.set(
    authConfig.cookies.user,
    JSON.stringify(user),
    {
      ...authConfig.cookieOptions,
      httpOnly: false, // Accessible côté client pour affichage
    }
  );
}

// Supprimer les cookies de session (logout)
export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(authConfig.cookies.accessToken);
  cookieStore.delete(authConfig.cookies.refreshToken);
  cookieStore.delete(authConfig.cookies.user);
}

// Vérifier si l'utilisateur a un rôle spécifique
export function hasRole(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

// Vérifier si l'utilisateur peut accéder à une route
export function canAccessRoute(user: User | null, pathname: string): boolean {
  // Routes publiques
  const isPublicRoute = authConfig.publicRoutes.some(route => {
    if (route.includes(':')) {
      // Route dynamique
      const pattern = route.replace(/:[\w]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route;
  });
  
  if (isPublicRoute) return true;
  
  // Si pas authentifié et route non publique
  if (!user) return false;
  
  // Routes protégées par rôle
  if (pathname.startsWith('/veilleur')) {
    return hasRole(user, ['VEILLEUR', 'MODERATEUR', 'ADMIN']);
  }
  
  if (pathname.startsWith('/moderateur')) {
    return hasRole(user, ['MODERATEUR', 'ADMIN']);
  }
  
  if (pathname.startsWith('/admin')) {
    return hasRole(user, ['ADMIN']);
  }
  
  // Routes utilisateur authentifié (profile, favorites, etc.)
  return true;
}
