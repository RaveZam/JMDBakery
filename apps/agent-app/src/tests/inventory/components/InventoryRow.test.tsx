import { render, screen, fireEvent } from "@testing-library/react-native";
import { InventoryRow } from "@/src/features/inventory/components/morning-inventory-screen-components/InventoryRow";
import { MorningInventoryContext } from "@/src/features/inventory/context/MorningInventoryProvider";
import type { Inventory } from "@/src/features/inventory/types/inventory-types";
import type { InventoryItem } from "@/src/lib/dao/session-inventory-dao";

function makeInventory(overrides: Partial<Inventory> = {}): Inventory {
  return {
    id: "sess-1",
    items: [],
    products: [],
    refreshInventory: jest.fn(),
    adjustItemQty: jest.fn(),
    setItemQty: jest.fn(),
    removeItem: jest.fn(),
    handleContinue: jest.fn(),
    cancelInventorySession: jest.fn(),
    ...overrides,
  };
}

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    inventoryId: "inv-1",
    productId: "prod-1",
    productName: "Pandesal",
    price: 10,
    qty: 12,
    ...overrides,
  };
}

function renderRow({
  item = makeItem(),
  inventory = makeInventory(),
  onEdit = () => {},
} = {}) {
  render(
    <MorningInventoryContext.Provider value={{ inventory }}>
      <InventoryRow item={item} onEdit={onEdit} />
    </MorningInventoryContext.Provider>,
  );
  return inventory;
}

test("shows the product name and quantity", () => {
  renderRow({ item: makeItem({ productName: "Ensaymada", qty: 7 }) });

  expect(screen.getByText("Ensaymada")).toBeOnTheScreen();
  expect(screen.getByText("7")).toBeOnTheScreen();
});

test("plus and minus adjust the product's quantity by ±1", () => {
  const inventory = renderRow();

  fireEvent.press(screen.getByText("+"));
  expect(inventory.adjustItemQty).toHaveBeenLastCalledWith("prod-1", 1);

  fireEvent.press(screen.getByText("−"));
  expect(inventory.adjustItemQty).toHaveBeenLastCalledWith("prod-1", -1);
});

test("the trash button removes the product", () => {
  const inventory = renderRow();

  fireEvent.press(screen.getByLabelText("remove-item"));

  expect(inventory.removeItem).toHaveBeenCalledWith("prod-1");
});

test("pressing the row itself opens the editor", () => {
  const onEdit = jest.fn();
  renderRow({ onEdit });

  fireEvent.press(screen.getByText("Pandesal"));

  expect(onEdit).toHaveBeenCalled();
});
