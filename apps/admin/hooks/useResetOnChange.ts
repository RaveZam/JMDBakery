import { useState } from "react";

/**
 * Runs onChange once, during render, the first render after value changes —
 * the React-recommended way to adjust state in response to a prop/value
 * change without an effect (see useStoreSales, StoreSalesLog).
 */
export function useResetOnChange<T>(value: T, onChange: () => void): void {
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    onChange();
  }
}
