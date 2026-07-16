import type { ReactElement, ReactNode } from "react";

type ModalPaneProps = {
  children: ReactNode;
};

export function ModalPane({ children }: ModalPaneProps): ReactElement {
  return (
    <div className="pointer-events-none relative flex h-full w-full items-center justify-center p-4">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border bg-background shadow-xl">
        {children}
      </div>
    </div>
  );
}
