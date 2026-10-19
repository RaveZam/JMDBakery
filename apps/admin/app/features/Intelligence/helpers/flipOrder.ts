/** Returns the rows in their ranked order, or back to front when flipped. */
export function flipOrder<Row>(rows: Row[], isFlipped: boolean): Row[] {
  return isFlipped ? [...rows].reverse() : rows;
}
