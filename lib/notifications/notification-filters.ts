import { parseNotificationsResponse } from '@/lib/notifications/parse-notifications';

export async function fetchNotificationsPage(
  endpoint: string,
  params: URLSearchParams,
): Promise<{ items: unknown[]; total: number; error?: string }> {
  const response = await fetch(`${endpoint}?${params}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (body as { message?: string }).message || 'Erreur lors du chargement des notifications';
    return { items: [], total: 0, error: message };
  }
  const json = await response.json();
  const { items, total } = parseNotificationsResponse(json);
  return { items, total };
}
