"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";

export type BlurredAreaBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Sold is the first blurred column: product name and Morning stay visible. */
const FIRST_BLURRED_COLUMN = 2;

/**
 * Measures the blurred cells of the inventory table (Sold through the last
 * column, product rows plus the total row) so a label can sit over their middle.
 */
export function useBlurredAreaBox(): {
  tableRef: RefObject<HTMLTableElement | null>;
  box: BlurredAreaBox | null;
} {
  const tableRef = useRef<HTMLTableElement>(null);
  const [box, setBox] = useState<BlurredAreaBox | null>(null);

  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const measure = (): void => {
      const firstCell = table.tBodies[0]?.rows[0]?.cells[FIRST_BLURRED_COLUMN];
      const totalsRow = table.tFoot?.rows[0];
      const lastCell = totalsRow?.cells[totalsRow.cells.length - 1];
      if (!firstCell || !lastCell) return;
      setBox({
        left: firstCell.offsetLeft,
        top: firstCell.offsetTop,
        width:
          lastCell.offsetLeft + lastCell.offsetWidth - firstCell.offsetLeft,
        height:
          lastCell.offsetTop + lastCell.offsetHeight - firstCell.offsetTop,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(table);
    return (): void => observer.disconnect();
  }, []);

  return { tableRef, box };
}
