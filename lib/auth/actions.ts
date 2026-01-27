'use server';

// Server Actions pour l'authentification
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authConfig } from './config';
import { setSessionCookies, clearSessionCookies, getSession } from './session';
import { apiConfig } from '@/config/api.config';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

// Appel API vers le backend
async function fetchBackend<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw error;
  }

  return response.json();
}

// Appel API avec token d'authentification
async function fetchBackendWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  
  if (!session.accessToken) {
    throw { message: 'Non authentifié', statusCode: 401 };
  }

  return fetchBackend<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
}

// Action de connexion
export async function loginAction(
  credentials: LoginCredentials
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchBackend<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    await setSessionCookies(response.tokens, response.user);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur de connexion',
    };
  }
}

// Action d'inscription
export async function registerAction(
  data: RegisterData
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchBackend<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await setSessionCookies(response.tokens, response.user);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur lors de l'inscription",
    };
  }
}

// Action de déconnexion
export async function logoutAction(): Promise<void> {
  const session = await getSession();

  // Appeler le backend pour invalider le token (optionnel)
  if (session.accessToken) {
    try {
      await fetchBackendWithAuth('/api/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Ignorer les erreurs de logout côté backend
    }
  }

  await clearSessionCookies();
  redirect('/login');
}

// Action de rafraîchissement du token
export async function refreshTokenAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getSession();

    if (!session.refreshToken) {
      return { success: false, error: 'Pas de refresh token' };
    }

    const response = await fetchBackend<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    await setSessionCookies(response.tokens, response.user);

    return { success: true };
  } catch (error: any) {
    // Si le refresh échoue, déconnecter l'utilisateur
    await clearSessionCookies();
    return {
      success: false,
      error: error.message || 'Session expirée',
    };
  }
}

// Action pour récupérer le profil utilisateur
export async function getProfileAction(): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const user = await fetchBackendWithAuth<User>('/api/auth/me');
    return { success: true, user };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération du profil',
    };
  }
}

// Action pour mettre à jour le profil
export async function updateProfileAction(
  data: Partial<User>
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await fetchBackendWithAuth<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    // Mettre à jour le cookie user
    const session = await getSession();
    if (session.accessToken && session.refreshToken) {
      await setSessionCookies(
        {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresIn: 3600,
        },
        user
      );
    }

    return { success: true, user };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la mise à jour du profil',
    };
  }
}

// Action mot de passe oublié
export async function forgotPasswordAction(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchBackend('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur lors de l'envoi de l'email",
    };
  }
}

// Action réinitialisation mot de passe
export async function resetPasswordAction(
  token: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchBackend('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la réinitialisation',
    };
  }
}
