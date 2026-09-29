/** Case-insensitive, trimmed lookup of a key in a list of official names. */
export function findKey(keys: string[], target: string): string | undefined {
  const normalized = target.trim().toLowerCase();
  if (!normalized) return undefined;
  return keys.find((key) => key.toLowerCase() === normalized);
}
