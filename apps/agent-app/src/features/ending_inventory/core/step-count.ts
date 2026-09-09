/**
 * Applies one stepper tap to a count.
 *
 * @param current - The count as it stands now.
 * @param delta - How far the tap moves it, e.g. +1 or -1.
 * @returns The new count, never below zero — a truck can't hold negative stock,
 *          so tapping minus at 0 leaves it at 0.
 */
export function stepCount(current: number, delta: number): number {
  return Math.max(0, current + delta);
}
