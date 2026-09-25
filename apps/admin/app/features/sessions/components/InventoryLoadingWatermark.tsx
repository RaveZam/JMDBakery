import type { ReactElement } from "react";

import type { BlurredAreaBox } from "../hooks/useBlurredAreaBox";

export function InventoryLoadingWatermark({
  box,
}: {
  box: BlurredAreaBox;
}): ReactElement {
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      style={box}
    >
      <span className="rounded-md bg-background/70 px-3 py-1 text-sm font-semibold text-foreground/60">
        Inventory loading in progress
      </span>
    </div>
  );
}
