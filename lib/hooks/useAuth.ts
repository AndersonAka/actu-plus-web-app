'use client';

// Hook client pour l'authentification
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { authConfig } from '../auth/config';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Charger l'utilisateur depuis le cookie au montage
  useEffect(() => {
    const loadUser = () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${authConfig.cookies.user}=`));

        if (userCookie) {
          const userValue = userCookie.split('=')[1];
          const user = JSON.parse(decodeURIComponent(userValue));
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadUser();

    // Écouter les changements de cookies
    const interval = setInterval(loadUser, 5000);
    return () => clearInterval(interval);
  }, []);

  // Vérifier si l'utilisateur a un rôle
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(state.user.role);
    },
    [state.user]
  );

  // Vérifier si l'utilisateur est veilleur ou supérieur
  const isVeilleur = useCallback((): boolean => {
    return hasRole([UserRole.VEILLEUR, UserRole.MANAGER, UserRole.ADMIN]);
  }, [hasRole]);

  // Vérifier si l'utilisateur est modérateur/manager ou supérieur
  const isModerateur = useCallback((): boolean => {
    return hasRole([UserRole.MANAGER, UserRole.ADMIN]);
  }, [hasRole]);

  // Vérifier si l'utilisateur est admin
  const isAdmin = useCallback((): boolean => {
    return hasRole([UserRole.ADMIN]);
  }, [hasRole]);

  // Rediriger vers login si non authentifié
  const requireAuth = useCallback(
    (redirectTo?: string) => {
      if (!state.isLoading && !state.isAuthenticated) {
        const returnUrl = redirectTo || window.location.pathname;
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    },
    [state.isLoading, state.isAuthenticated, router]
  );

  // Rediriger si l'utilisateur n'a pas le rôle requis
  const requireRole = useCallback(
    (roles: UserRole | UserRole[], redirectTo: string = '/') => {
      if (!state.isLoading) {
        if (!state.isAuthenticated) {
          router.push('/login');
        } else if (!hasRole(roles)) {
          router.push(redirectTo);
        }
      }
    },
    [state.isLoading, state.isAuthenticated, hasRole, router]
  );

  return {
    ...state,
    hasRole,
    isVeilleur,
    isModerateur,
    isAdmin,
    requireAuth,
    requireRole,
  };
}
