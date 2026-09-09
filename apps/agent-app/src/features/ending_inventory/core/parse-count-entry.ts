/**
 * Reads a count the driver typed into a stepper's field.
 *
 * @param text - Raw text from the input, e.g. "47", "", or "4a7" on a keyboard
 *               that let a stray character through.
 * @returns The count as a whole number, never negative. Anything that isn't a
 *          number at all — an empty field mid-edit included — reads as 0, so the
 *          field always holds a usable count.
 */
export function parseCountEntry(text: string): number {
  const parsed = parseInt(text, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}
