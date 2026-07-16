import type { ReactElement, ReactNode } from "react";

import { ModalOverlay } from "./ModalOverlay";
import { ModalPane } from "./ModalPane";

type ModalDialogProps = {
  titleId: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalDialog({
  titleId,
  onClose,
  children,
}: ModalDialogProps): ReactElement {
  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <ModalOverlay onClose={onClose} />
      <ModalPane>{children}</ModalPane>
    </div>
  );
}
