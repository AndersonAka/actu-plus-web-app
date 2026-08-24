import { Article } from '@/types';

export const SECTOR_LABELS: Record<string, string> = {
  'banque-assurance': 'Banque & Assurance',
  energie: 'Énergie',
  'agro-industrielle': 'Agro Industrielle',
};

/**
 * Les articles Veille Sectorielle n'ont pas de catégorie (champ retiré du
 * formulaire) : on affiche le secteur à la place.
 */
export function getArticleCategoryLabel(article: Pick<Article, 'category' | 'sector'>): string | null {
  if (article.category?.name) return article.category.name;
  if (article.sector) return SECTOR_LABELS[article.sector] || null;
  return null;
}
