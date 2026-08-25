/**
 * Un veilleur peut coller par mégarde un lien vers son propre espace privé
 * (/veilleur, /moderateur, /admin) dans le contenu d'un article — ce lien est
 * inaccessible à un lecteur normal (401/redirection login). On neutralise ces
 * liens avant affichage public plutôt que de laisser un lien mort.
 */
const INTERNAL_PRIVATE_PATH_REGEX = /^\/?(veilleur|moderateur|admin)(\/|$)/i;

export function isInternalPrivateLink(href: string): boolean {
  if (!href) return false;
  const path = href.replace(/^https?:\/\/[^/]+/i, '');
  return INTERNAL_PRIVATE_PATH_REGEX.test(path);
}

const ANCHOR_REGEX = /<a\b[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

export function sanitizeArticleContent(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(ANCHOR_REGEX, (fullMatch, href: string, innerHtml: string) =>
    isInternalPrivateLink(href) ? innerHtml : fullMatch,
  );
}

/** Retire tous les liens (quelle que soit leur cible), en gardant le texte visible. */
export function stripAllLinks(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(ANCHOR_REGEX, (_fullMatch, _href: string, innerHtml: string) => innerHtml);
}
