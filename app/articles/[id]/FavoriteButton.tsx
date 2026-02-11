'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/atoms';

interface FavoriteButtonProps {
  articleId: string;
}

export function FavoriteButton({ articleId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/proxy/favorites/check/${articleId}`);
        if (res.ok) {
          const data = await res.json();
          setIsFavorited(data.isFavorited || data.data?.isFavorited || false);
          setIsAuthenticated(true);
        }
      } catch {
        // User not authenticated or error — hide or disable
      }
    };
    checkFavorite();
  }, [articleId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      if (isFavorited) {
        const res = await fetch(`/api/proxy/favorites/${articleId}`, {
          method: 'DELETE',
        });
        if (res.ok) setIsFavorited(false);
      } else {
        const res = await fetch(`/api/proxy/favorites/${articleId}`, {
          method: 'POST',
        });
        if (res.ok) setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      leftIcon={
        <Heart
          className={`h-4 w-4 transition-colors ${
            isFavorited ? 'fill-red-500 text-red-500' : ''
          }`}
        />
      }
      className={isFavorited ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}
    >
      {isFavorited ? 'Favori' : 'Ajouter aux favoris'}
    </Button>
  );
}
