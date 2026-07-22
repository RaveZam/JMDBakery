import { useEffect } from "react";

export function useCloseOnEscape(active: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!active) return;
    function handleKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [active, onClose]);
}
