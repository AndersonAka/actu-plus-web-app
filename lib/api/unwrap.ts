/** Extrait le payload d'une réponse NestJS `{ success, data, timestamp }`. */
export function unwrapApiData<T>(json: unknown): T {
  if (
    json &&
    typeof json === 'object' &&
    'data' in json &&
    (json as { success?: boolean }).success === true
  ) {
    return (json as { data: T }).data;
  }
  return json as T;
}
