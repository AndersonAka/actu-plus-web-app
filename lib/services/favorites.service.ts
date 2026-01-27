/**
 * Service pour la gestion des favoris
 */

import { apiEndpoints } from '@/lib/api/endpoints';
import { Article } from '@/types';

export interface FavoritesResponse {
  success: boolean;
  data: {
    data: Article[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class FavoritesService {
  /**
   * Récupère la liste des articles favoris
   */
  async findAll(params?: { page?: number; limit?: number }): Promise<FavoritesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const url = queryParams.toString() 
      ? `${apiEndpoints.favorites.list}?${queryParams.toString()}`
      : apiEndpoints.favorites.list;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des favoris');
    }

    return response.json();
  }

  /**
   * Vérifie si un article est en favoris
   */
  async isFavorite(articleId: string): Promise<boolean> {
    try {
      const response = await fetch(`${apiEndpoints.favorites.list}/${articleId}/check`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) return false;
      const result = await response.json();
      return result.data?.isFavorite || false;
    } catch {
      return false;
    }
  }

  /**
   * Ajoute un article aux favoris
   */
  async add(articleId: string): Promise<void> {
    const response = await fetch(apiEndpoints.favorites.add, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout aux favoris');
    }
  }

  /**
   * Retire un article des favoris
   */
  async remove(articleId: string): Promise<void> {
    const response = await fetch(apiEndpoints.favorites.remove(articleId), {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression des favoris');
    }
  }
}

export const favoritesService = new FavoritesService();
