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

function getItemGroupKey(item: SummaryItem): string {
  if (item.categoryName?.trim()) return item.categoryName.trim();
  if (item.sector && SECTOR_LABELS[item.sector]) return SECTOR_LABELS[item.sector];
  if (item.sector) return item.sector;
  return 'Actualité';
}

function groupItemsByCategory(items: SummaryItem[]): { category: string; items: SummaryItem[] }[] {
  return items.reduce<{ category: string; items: SummaryItem[] }[]>((groups, item) => {
    const category = getItemGroupKey(item);
    const existing = groups.find((g) => g.category.toLowerCase() === category.toLowerCase());
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ category, items: [item] });
    }
    return groups;
  }, []);
}

export function SummaryItemsList({ items, limit, hideLinks = false }: SummaryItemsListProps) {
  const visibleItems = limit ? items.slice(0, limit) : items;
  const groups = groupItemsByCategory(visibleItems);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.category}>
          <div className="mb-4 border-b border-gray-100 pb-2">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary-600">
              {group.category}
            </h3>
          </div>
          <div className="space-y-8">
            {group.items.map((item, index) => (
              <div
                key={`${group.category}-${index}`}
                className={index > 0 ? 'border-t border-gray-100 pt-8' : ''}
              >
                <h4 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h4>
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
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
