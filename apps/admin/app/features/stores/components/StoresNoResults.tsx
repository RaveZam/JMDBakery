import type { ReactElement } from "react";
import { SearchX } from "lucide-react";

export function StoresNoResults({
  search,
  onClearSearch,
}: {
  search: string;
  onClearSearch: () => void;
}): ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-muted-foreground">
      <SearchX className="h-9 w-9 opacity-40" />
      <p className="text-sm font-medium text-foreground">
        No stores match &ldquo;{search}&rdquo;
      </p>
      <p className="text-xs">Try a store name, city, or province.</p>
      <button
        type="button"
        onClick={onClearSearch}
        className="mt-2 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Clear search
      </button>
    </div>
  );
}
