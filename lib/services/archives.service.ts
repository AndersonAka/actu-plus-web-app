/**
 * Service pour la gestion des archives
 */

import { apiEndpoints } from '@/lib/api/endpoints';
import { Article } from '@/types';

export interface ArchivesResponse {
  success: boolean;
  data: {
    data: Article[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ArchivesService {
  /**
   * Récupère la liste des articles archivés
   */
  async findAll(params?: { page?: number; limit?: number }): Promise<ArchivesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const url = queryParams.toString() 
      ? `${apiEndpoints.archives.list}?${queryParams.toString()}`
      : apiEndpoints.archives.list;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des archives');
    }

    return response.json();
  }

  /**
   * Vérifie si un article est archivé
   */
  async isArchived(articleId: string): Promise<boolean> {
    try {
      const response = await fetch(`${apiEndpoints.archives.list}/${articleId}/check`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) return false;
      const result = await response.json();
      return result.data?.isArchived || false;
    } catch {
      return false;
    }
  }

  /**
   * Archive un article
   */
  async add(articleId: string): Promise<void> {
    const response = await fetch(apiEndpoints.archives.add, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'archivage');
    }
  }

  /**
   * Désarchive un article
   */
  async remove(articleId: string): Promise<void> {
    const response = await fetch(apiEndpoints.archives.remove(articleId), {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du désarchivage');
    }
  }
}

export const archivesService = new ArchivesService();
