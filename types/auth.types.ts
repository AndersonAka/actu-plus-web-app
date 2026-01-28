// Types pour l'authentification
export interface UserSubscription {
  id: string;
  tier: 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  civility?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Enterprise fields
  isEnterpriseUser?: boolean;
  singleSessionOnly?: boolean;
  
  // Subscription info
  subscription?: UserSubscription;
}

export enum UserRole {
  USER = 'user',           // Utilisateur standard (lecteur)
  VEILLEUR = 'veilleur',   // Crée les articles (brouillon)
  MANAGER = 'manager',     // Valide/Annule et publie les articles (moderateur)
  ADMIN = 'admin',         // Administration complète
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
