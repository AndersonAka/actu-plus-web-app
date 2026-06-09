import { unwrapApiData } from '@/lib/api/unwrap';

export interface NotificationsPageResult {
  items: unknown[];
  total: number;
}

/** Parse une réponse paginée notifications NestJS. */
export function parseNotificationsResponse(json: unknown): NotificationsPageResult {
  const root = unwrapApiData<unknown>(json);

  if (Array.isArray(root)) {
    return { items: root, total: root.length };
  }

  if (root && typeof root === 'object') {
    const payload = root as {
      data?: unknown[];
      items?: unknown[];
      total?: number;
      meta?: { total?: number };
    };
    const items = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.items)
        ? payload.items
        : [];
    const total =
      typeof payload.total === 'number'
        ? payload.total
        : typeof payload.meta?.total === 'number'
          ? payload.meta.total
          : items.length;
    return { items, total };
  }

  return { items: [], total: 0 };
}

/** Parse le compteur de notifications non lues. */
export function parseUnreadCount(json: unknown): number {
  const root = unwrapApiData<unknown>(json);
  if (root && typeof root === 'object' && 'count' in root) {
    const count = (root as { count?: number }).count;
    return typeof count === 'number' ? count : 0;
  }
  if (json && typeof json === 'object' && 'count' in (json as object)) {
    const count = (json as { count?: number }).count;
    return typeof count === 'number' ? count : 0;
  }
  return 0;
}
