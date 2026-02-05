'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useFavorites() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  // Charger les favoris au montage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch('/api/proxy/favorites?limit=100');
        if (response.ok) {
          const data = await response.json();
          const favoritesList = data.data?.data || data.data || [];
          const favoriteIds = new Set<string>(
            favoritesList
              .filter((fav: any) => fav.article || fav.articleId)
              .map((fav: any) => (fav.article?.id || fav.articleId) as string)
          );
          setFavorites(favoriteIds);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setInitialized(true);
      }
    };

    if (!initialized) {
      loadFavorites();
    }
  }, [initialized]);

  const toggleFavorite = useCallback(async (articleId: string) => {
    setLoading(prev => ({ ...prev, [articleId]: true }));

    try {
      const isFavorite = favorites.has(articleId);
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/proxy/favorites/${articleId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Not authenticated, redirect to login
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      if (response.ok) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (isFavorite) {
            newFavorites.delete(articleId);
          } else {
            newFavorites.add(articleId);
          }
          return newFavorites;
        });
      } else {
        console.error('Failed to toggle favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(prev => ({ ...prev, [articleId]: false }));
    }
  }, [favorites, router]);

  const isFavorite = useCallback((articleId: string) => {
    return favorites.has(articleId);
  }, [favorites]);

  const isLoading = useCallback((articleId: string) => {
    return loading[articleId] || false;
  }, [loading]);

  return {
    toggleFavorite,
    isFavorite,
    isLoading,
    favorites,
  };
}
