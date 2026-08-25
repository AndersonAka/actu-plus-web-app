import { SummaryItem } from '@/types';
import { isInternalPrivateLink, sanitizeArticleContent } from '@/lib/articles/sanitize-content';

export interface SummaryItemsListProps {
  items: SummaryItem[];
  /** Limite le nombre d'entrées affichées (aperçu premium) */
  limit?: number;
}

export function SummaryItemsList({ items, limit }: SummaryItemsListProps) {
  const visibleItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="space-y-8">
      {visibleItems.map((item, index) => (
        <div key={index} className={index > 0 ? 'border-t border-gray-100 pt-8' : ''}>
          <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(item.summary) }} />
          {item.link && !isInternalPrivateLink(item.link) && (
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
      ))}
    </div>
  );
}
