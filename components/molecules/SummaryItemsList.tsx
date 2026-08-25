import { SummaryItem } from '@/types';
import { isInternalPrivateLink, sanitizeArticleContent, stripAllLinks } from '@/lib/articles/sanitize-content';
import { SECTOR_LABELS } from '@/lib/articles/article-labels';

export interface SummaryItemsListProps {
  items: SummaryItem[];
  /** Limite le nombre d'entrées affichées (aperçu premium) */
  limit?: number;
  /** Masque tout lien (inline et bouton "En savoir plus"), quelle que soit sa cible */
  hideLinks?: boolean;
}

export function SummaryItemsList({ items, limit, hideLinks = false }: SummaryItemsListProps) {
  const visibleItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="space-y-8">
      {visibleItems.map((item, index) => {
        const badgeLabel = item.categoryName || (item.sector ? SECTOR_LABELS[item.sector] : null);
        return (
        <div key={index} className={index > 0 ? 'border-t border-gray-100 pt-8' : ''}>
          {badgeLabel && (
            <span className="mb-1.5 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {badgeLabel}
            </span>
          )}
          <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
          <div
            dangerouslySetInnerHTML={{
              __html: hideLinks ? stripAllLinks(item.summary) : sanitizeArticleContent(item.summary),
            }}
          />
          {!hideLinks && item.link && !isInternalPrivateLink(item.link) && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              En savoir plus →
            </a>
          )}
        </div>
        );
      })}
    </div>
  );
}
