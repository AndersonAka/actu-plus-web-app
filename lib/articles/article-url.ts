const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isArticleUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/** Chemin public canonique (aligné sur les liens e-mail). */
export function getArticlePublicPath(article: {
  id: string;
  slug?: string | null;
}): string {
  return `/articles/${article.slug || article.id}`;
}

/** URL API — le backend accepte UUID ou slug sur GET /api/articles/:id */
export function getArticleApiPath(baseUrl: string, idOrSlug: string): string {
  return `${baseUrl}/api/articles/${encodeURIComponent(idOrSlug)}`;
}
