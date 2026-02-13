export function buildQueryString<T extends object>(
  params?: T,
): string {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString();
}

export function buildUrl<T extends object>(
  baseUrl: string,
  params?: T,
): string {
  const qs = buildQueryString(params);
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}
