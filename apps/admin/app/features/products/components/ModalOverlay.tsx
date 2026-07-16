import type { ReactElement } from "react";

export function ModalOverlay({
  onClose,
}: {
  onClose: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      className="absolute inset-0 bg-black/40"
      aria-label="Close"
      onClick={onClose}
    />
  );
}
