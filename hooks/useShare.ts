'use client';

import { useCallback } from 'react';

export interface ShareOptions {
  title: string;
  text?: string;
  url: string;
}

export function useShare() {
  const share = useCallback(async (options: ShareOptions) => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return false;
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(options.url);
        alert('Lien copié dans le presse-papiers !');
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
    }
  }, []);

  const shareArticle = useCallback((articleId: string, title: string) => {
    const url = `${window.location.origin}/articles/${articleId}`;
    return share({
      title: `${title} - Actu Plus`,
      text: `Découvrez cet article sur Actu Plus`,
      url,
    });
  }, [share]);

  return {
    share,
    shareArticle,
  };
}
