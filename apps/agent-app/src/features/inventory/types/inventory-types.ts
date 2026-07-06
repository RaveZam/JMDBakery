import type { InventoryItem } from "@/src/lib/dao/session-inventory-dao";

export type Product = { id: string; name: string; price: number };

export type Inventory = {
  id: string | null;
  items: InventoryItem[];
  products: Product[];
  refreshInventory: () => void;
  adjustItemQty: (productId: string, delta: number) => void;
  setItemQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  handleContinue: () => void;
};
