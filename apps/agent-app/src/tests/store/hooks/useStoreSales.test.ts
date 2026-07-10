import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useStoreSales } from "@/src/features/store/hooks/useStoreSales";
import {
  addSale,
  updateSale,
  removeSale,
  getSalesByRouteSession,
  getSalesBySessionStore,
} from "@/src/features/store/services/sales-services";
import type { LoggedItem } from "@/src/features/store/types/store-types";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({
    sessionId: "session-1",
    sessionStoreId: "ss-1",
  }),
}));

// Morning truck stock: 10 Pandesal. Prices come from the products table.
jest.mock("@/src/lib/dao/session-inventory-dao", () => ({
  __esModule: true,
  default: {
    getBySessionId: () => [
      {
        inventoryId: "inv-1",
        productId: "p1",
        productName: "Pandesal",
        qty: 10,
      },
    ],
  },
}));
jest.mock("@/src/lib/dao/products-dao", () => ({
  ProductsDao: {
    getAllProducts: () => [{ id: "p1", name: "Pandesal", price: 10 }],
  },
}));

jest.mock("@/src/features/store/services/sales-services");
const mockedByRoute = getSalesByRouteSession as jest.Mock;
const mockedByStore = getSalesBySessionStore as jest.Mock;

function makeSold(overrides: Partial<LoggedItem> = {}): LoggedItem {
  return {
    saleId: "sale-1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 2,
    boQty: 1,
    boReason: "Damaged",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedByRoute.mockReturnValue([]);
  mockedByStore.mockReturnValue([]);
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

test("exposes products with prices and remaining stock net of session sales", () => {
  mockedByRoute.mockReturnValue([makeSold({ qty: 2, boQty: 1 })]);

  const { result } = renderHook(() => useStoreSales());

  expect(result.current.inventory.products).toEqual([
    { id: "p1", name: "Pandesal", price: 10 },
  ]);
  // 10 stocked - 2 sold - 1 bad order
  expect(result.current.inventory.remaining).toEqual({ p1: 7 });
});

test("addOrder saves the sale, resets the form, and closes the modal", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.inventory.open();
    result.current.inventory.setSelectedProduct({
      id: "p1",
      name: "Pandesal",
      price: 10,
    });
    result.current.inventory.setQuantity(3);
  });
  act(() => result.current.inventory.addOrder());

  expect(addSale).toHaveBeenCalledWith({
    sessionStoreId: "ss-1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 3,
    boQty: 0,
    boReason: "",
  });
  expect(result.current.inventory.visible).toBe(false);
  expect(result.current.inventory.quantity).toBe(0);
  expect(result.current.inventory.selectedProduct).toBeNull();
});

test("addOrder does nothing while the input is invalid (no qty, no BO)", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() =>
    result.current.inventory.setSelectedProduct({
      id: "p1",
      name: "Pandesal",
      price: 10,
    }),
  );
  act(() => result.current.inventory.addOrder());

  expect(addSale).not.toHaveBeenCalled();
});

test("flags needsReason when BO qty is set without a reason, and blocks saving", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.inventory.setSelectedProduct({
      id: "p1",
      name: "Pandesal",
      price: 10,
    });
    result.current.inventory.setBoQty(2);
  });

  expect(result.current.inventory.needsReason).toBe(true);
  act(() => result.current.inventory.addOrder());
  expect(addSale).not.toHaveBeenCalled();
});

test("addOrder alerts and keeps the modal open when stock runs short", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.inventory.open();
    result.current.inventory.setSelectedProduct({
      id: "p1",
      name: "Pandesal",
      price: 10,
    });
    result.current.inventory.setQuantity(11); // only 10 stocked
  });
  act(() => result.current.inventory.addOrder());

  expect(Alert.alert).toHaveBeenCalledWith(
    "Not enough stock",
    expect.stringContaining("Pandesal"),
  );
  expect(addSale).not.toHaveBeenCalled();
  expect(result.current.inventory.visible).toBe(true);
});

test("onItemPress prefills the form and addOrder routes to updateSale", () => {
  mockedByStore.mockReturnValue([makeSold()]);
  mockedByRoute.mockReturnValue([makeSold()]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.inventory.onItemPress(0));

  expect(result.current.inventory.quantity).toBe(2);
  expect(result.current.inventory.boQty).toBe(1);
  expect(result.current.inventory.boReasonType).toBe("Damaged");
  expect(result.current.inventory.editingSaleId).toBe("sale-1");
  expect(result.current.inventory.visible).toBe(true);

  act(() => result.current.inventory.setQuantity(4));
  act(() => result.current.inventory.addOrder());

  expect(updateSale).toHaveBeenCalledWith(
    expect.objectContaining({ saleId: "sale-1", qty: 4, boQty: 1 }),
  );
  expect(addSale).not.toHaveBeenCalled();
});

test("editing can reuse the sale's own units without tripping the stock check", () => {
  // Whole truck stock already consumed by this sale: remaining is 0.
  mockedByStore.mockReturnValue([makeSold({ qty: 9, boQty: 1 })]);
  mockedByRoute.mockReturnValue([makeSold({ qty: 9, boQty: 1 })]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.inventory.onItemPress(0));
  act(() => result.current.inventory.setQuantity(10));
  act(() => result.current.inventory.setBoQty(0));
  act(() => result.current.inventory.addOrder());

  expect(Alert.alert).not.toHaveBeenCalled();
  expect(updateSale).toHaveBeenCalledWith(
    expect.objectContaining({ saleId: "sale-1", qty: 10, boQty: 0 }),
  );
});

test.each([
  ["Damaged", "Damaged"], // preset reason maps to itself
  ["Squished in transit", "Custom"], // free-text reason maps to Custom
  [undefined, null], // no reason at all
])("onItemPress maps stored reason %p to reason type %p", (stored, expected) => {
  mockedByStore.mockReturnValue([makeSold({ boReason: stored as string })]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.inventory.onItemPress(0));

  expect(result.current.inventory.boReasonType).toBe(expected);
});

test("onDeleteItem removes the sale only after the alert is confirmed", () => {
  mockedByStore.mockReturnValue([makeSold()]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.inventory.onDeleteItem(0));

  expect(removeSale).not.toHaveBeenCalled();
  const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
  act(() => buttons.find((b: { style: string }) => b.style === "destructive").onPress());

  expect(removeSale).toHaveBeenCalledWith("sale-1");
});

test("close resets any in-progress form state", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.inventory.open();
    result.current.inventory.setQuantity(5);
    result.current.inventory.selectReason("Custom");
  });
  act(() => result.current.inventory.close());

  expect(result.current.inventory.visible).toBe(false);
  expect(result.current.inventory.quantity).toBe(0);
  expect(result.current.inventory.boReasonType).toBeNull();
});
