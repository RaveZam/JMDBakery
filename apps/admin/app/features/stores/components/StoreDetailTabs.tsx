import type { ReactElement } from "react";

export type StoreDetailTab = "info" | "credits";

const TABS: { id: StoreDetailTab; label: string }[] = [
  { id: "info", label: "Store Info" },
  { id: "credits", label: "Store Credits" },
];

export function StoreDetailTabs({
  active,
  onChange,
}: {
  active: StoreDetailTab;
  onChange: (tab: StoreDetailTab) => void;
}): ReactElement {
  return (
    <div className="flex gap-1 border-b px-5">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
