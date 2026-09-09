/**
 * Returns a new Set with `value` removed if it was present, or added if it
 * wasn't. The input Set is left untouched so React sees a fresh reference.
 *
 * @param set - The current Set.
 * @param value - The item to flip in or out.
 * @returns A new Set; `set` is not mutated.
 */
export function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}
