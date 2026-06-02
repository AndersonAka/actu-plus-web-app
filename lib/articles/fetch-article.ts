import { unwrapApiData } from '@/lib/api/unwrap';
import { isArticleUuid } from '@/lib/articles/article-url';

/**
 * Charge un article par UUID ou slug.
 * Compatible prod actuelle : GET /api/articles/slug/:slug si :id renvoie 400/404.
 */
export async function fetchArticleByIdOrSlug(
  baseUrl: string,
  idOrSlug: string,
): Promise<unknown | null> {
  const encoded = encodeURIComponent(idOrSlug);
  const urls: string[] = [];

  if (isArticleUuid(idOrSlug)) {
    urls.push(`${baseUrl}/api/articles/${encoded}`);
  } else {
    urls.push(`${baseUrl}/api/articles/${encoded}`);
    urls.push(`${baseUrl}/api/articles/slug/${encoded}`);
  }

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        return unwrapApiData(await response.json());
      }
      if (response.status !== 400 && response.status !== 404) {
        return null;
      }
    } catch {
      // essayer l'URL suivante
    }
  }

  return null;
}
