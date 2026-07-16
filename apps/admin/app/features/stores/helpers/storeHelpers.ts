import type { GroupedStoreRow, StoreRow, TopProduct } from "../types/store-types";

export function formatAddress(
  barangay: string | null,
  city: string | null,
  province: string | null,
): string {
  return [barangay, city, province].filter(Boolean).join(", ") || "No address";
}

// Same store, entered more than once with different casing/whitespace, looks
// like two rows to the DB (e.g. "Poblacion" vs "poblacion "). Trim, lowercase,
// and collapse internal whitespace to "-" so those rows key together.
function normalizeKey(store: StoreRow): string {
  return [store.storeName, store.barangay, store.city, store.province]
    .map((value) => (value ?? "").trim().toLowerCase().replace(/\s+/g, "-"))
    .join("|");
}

// Canonical display fields (name/address/id) come from the most recently
// created row in the group, since that's the entry most likely to have
// corrected typos from earlier duplicates.
export function groupStoresByLocation(stores: StoreRow[]): GroupedStoreRow[] {
  const groups = new Map<string, StoreRow[]>();
  for (const store of stores) {
    const key = normalizeKey(store);
    //"red-ribbon|poblacion|santiago|isabela"
    const group = groups.get(key) ?? [];

    // [{id: "s1", storeName: "Red Ribbon", totalRevenue: 500, createdAt: "2026-01-01", ...}]
    group.push(store);
    // groups.get("red-ribbon|poblacion|santiago|isabela") === [{id: "s1", ...}, {id: "s2", ...}]
    groups.set(key, group);
  }

  // Groups the stores by location via comparing the trimmed, lowercased keys,
  // picks the newest row as canonical, sums revenue across the group, and
  // sorts the resulting cards by revenue highest to lowest.
  return Array.from(groups.values())
    .map((group) => {
      // group sorted newest-first; canonical = group[0] after sort, e.g.
      // {id: "s2", storeName: "red ribbon ", createdAt: "2026-03-01", totalRevenue: 300}
      const [canonical] = [...group].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return {
        // canonical's storeName/barangay/city/province/id/createdAt win, e.g. "red ribbon "
        ...canonical,
        // sum across every row in the group, e.g. 500 + 300 = 800
        totalRevenue: group.reduce((sum, store) => sum + store.totalRevenue, 0),
        // every raw row's id, e.g. ["s1", "s2"]
        memberIds: group.map((store) => store.id),
      };
      // -> {id: "s2", storeName: "red ribbon ", totalRevenue: 800, memberIds: ["s1", "s2"], ...}
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// results is one TopProduct[] per store id; flatten and sum by
// product name into a single ranked list.
export function mergeTopProducts(results: TopProduct[][]): TopProduct[] {
  const merged = new Map<string, number>();
  for (const products of results) {
    for (const { productName, revenue } of products) {
      merged.set(productName, (merged.get(productName) ?? 0) + revenue);
    }
  }
  return Array.from(merged, ([productName, revenue]) => ({ productName, revenue })).sort(
    (a, b) => b.revenue - a.revenue,
  );
}
