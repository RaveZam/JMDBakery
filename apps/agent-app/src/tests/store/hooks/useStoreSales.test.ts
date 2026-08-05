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

// Morning truck stock: 10 Pandesal at ₱10. Name and price both come from the
// inventory snapshot — the hook never reads the products table.
jest.mock("@/src/lib/dao/session-inventory-dao", () => ({
  __esModule: true,
  default: {
    getBySessionId: () => [
      {
        inventoryId: "inv-1",
        productId: "p1",
        productName: "Pandesal",
        price: 10,
        qty: 10,
      },
    ],
  },
}));

jest.mock("@/src/features/store/services/sales-services");
const mockedByRoute = getSalesByRouteSession as jest.Mock;
const mockedByStore = getSalesBySessionStore as jest.Mock;

// This session store has no province modifiers in play by default.
jest.mock("@/src/features/store/services/store-services", () => ({
  getSessionStoreById: jest.fn(() => ({ store_province: null })),
}));

jest.mock("@/src/features/store/services/store-credit-service", () => ({
  syncVisitCredit: jest.fn(),
}));

jest.mock("@/src/lib/dao/province-price-modifiers-dao", () => ({
  ProvincePriceModifiersDao: {
    getAllProvincePriceModifiers: jest.fn(() => []),
  },
}));

function makeSold(overrides: Partial<LoggedItem> = {}): LoggedItem {
  return {
    saleId: "sale-1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 2,
    boQty: 1,
    boReason: "Damaged",
    paymentType: "cash",
    ...overrides,
  };
}

beforeEach(() => {
  // clearAllMocks wipes recorded calls but leaves mockReturnValue in place, so
  // every default a test may override is re-pinned here rather than in the
  // module factory — otherwise one test's override leaks into the next.
  jest.clearAllMocks();
  mockedByRoute.mockReturnValue([]);
  mockedByStore.mockReturnValue([]);
  jest
    .requireMock("@/src/features/store/services/store-services")
    .getSessionStoreById.mockReturnValue({ store_province: null });
  jest
    .requireMock("@/src/lib/dao/province-price-modifiers-dao")
    .ProvincePriceModifiersDao.getAllProvincePriceModifiers.mockReturnValue([]);
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

test("exposes products with prices and remaining stock net of session sales", () => {
  mockedByRoute.mockReturnValue([makeSold({ qty: 2, boQty: 1 })]);

  const { result } = renderHook(() => useStoreSales());

  expect(result.current.adder.catalog.products).toEqual([
    { id: "p1", name: "Pandesal", price: 10 },
  ]);
  // 10 stocked - 2 sold - 1 bad order
  expect(result.current.adder.catalog.remaining).toEqual({ p1: 7 });
});

test("applies a matching province price modifier to the product's price", () => {
  jest
    .requireMock("@/src/features/store/services/store-services")
    .getSessionStoreById.mockReturnValue({
      store_province: "Isabela - Tuguegarao",
    });
  jest
    .requireMock("@/src/lib/dao/province-price-modifiers-dao")
    .ProvincePriceModifiersDao.getAllProvincePriceModifiers.mockReturnValue([
      { product_id: "p1", province_keyword: "tuguegarao", price_modifier: -1 },
    ]);

  const { result } = renderHook(() => useStoreSales());

  expect(result.current.adder.catalog.products).toEqual([
    { id: "p1", name: "Pandesal", price: 9 },
  ]);
});

test("addOrder saves the sale, resets the form, and closes the modal", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.orders.open();
    result.current.adder.catalog.select({
      id: "p1",
      name: "Pandesal",
      price: 10,
    });
    result.current.adder.form.setQuantity(3);
  });
  act(() => result.current.adder.submit());

  expect(addSale).toHaveBeenCalledWith({
    sessionStoreId: "ss-1",
    productId: "p1",
    productName: "Pandesal",
    price: 10,
    qty: 3,
    boQty: 0,
    boReason: "",
    paymentType: "cash",
  });
  expect(result.current.adder.visible).toBe(false);
  expect(result.current.adder.form.quantity).toBe(0);
  expect(result.current.adder.catalog.selected).toBeNull();
});

test("addOrder does nothing while the input is invalid (no qty, no BO)", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() =>
    result.current.adder.catalog.select({
      id: "p1",
      name: "Pandesal",
      price: 10,
    }),
  );
  act(() => result.current.adder.submit());

  expect(addSale).not.toHaveBeenCalled();
});

test("flags needsReason when BO qty is set without a reason, and blocks saving", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.adder.catalog.select({
      id: "p1",
      name: "Pandesal",
      price: 10,
    });
    result.current.adder.form.badOrder.setQuantity(2);
  });

  expect(result.current.adder.form.badOrder.needsReason).toBe(true);
  act(() => result.current.adder.submit());
  expect(addSale).not.toHaveBeenCalled();
});

test("addOrder alerts and keeps the modal open when stock runs short", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.orders.open();
    result.current.adder.catalog.select({
      id: "p1",
      name: "Pandesal",
      price: 10,
    });
    result.current.adder.form.setQuantity(11); // only 10 stocked
  });
  act(() => result.current.adder.submit());

  expect(Alert.alert).toHaveBeenCalledWith(
    "Not enough stock",
    expect.stringContaining("Pandesal"),
  );
  expect(addSale).not.toHaveBeenCalled();
  expect(result.current.adder.visible).toBe(true);
});

test("onItemPress prefills the form and addOrder routes to updateSale", () => {
  mockedByStore.mockReturnValue([makeSold()]);
  mockedByRoute.mockReturnValue([makeSold()]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.orders.onItemPress(0));

  expect(result.current.adder.form.quantity).toBe(2);
  expect(result.current.adder.form.badOrder.quantity).toBe(1);
  expect(result.current.adder.form.badOrder.reasonType).toBe("Damaged");
  expect(result.current.adder.mode).toBe("edit");
  expect(result.current.adder.visible).toBe(true);

  act(() => result.current.adder.form.setQuantity(4));
  act(() => result.current.adder.submit());

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

  act(() => result.current.orders.onItemPress(0));
  act(() => result.current.adder.form.setQuantity(10));
  act(() => result.current.adder.form.badOrder.setQuantity(0));
  act(() => result.current.adder.submit());

  expect(Alert.alert).not.toHaveBeenCalled();
  expect(updateSale).toHaveBeenCalledWith(
    expect.objectContaining({ saleId: "sale-1", qty: 10, boQty: 0 }),
  );
});

test.each([
  ["Damaged", "Damaged"], // preset reason maps to itself
  ["Squished in transit", "Custom"], // free-text reason maps to Custom
  [undefined, null], // no reason at all
])(
  "onItemPress maps stored reason %p to reason type %p",
  (stored, expected) => {
    mockedByStore.mockReturnValue([makeSold({ boReason: stored as string })]);
    const { result } = renderHook(() => useStoreSales());

    act(() => result.current.orders.onItemPress(0));

    expect(result.current.adder.form.badOrder.reasonType).toBe(expected);
  },
);

test("onDeleteItem removes the sale only after the alert is confirmed", () => {
  mockedByStore.mockReturnValue([makeSold()]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.orders.onDeleteItem(0));

  expect(removeSale).not.toHaveBeenCalled();
  const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
  act(() =>
    buttons.find((b: { style: string }) => b.style === "destructive").onPress(),
  );

  expect(removeSale).toHaveBeenCalledWith("sale-1");
});

test("close resets any in-progress form state", () => {
  const { result } = renderHook(() => useStoreSales());

  act(() => {
    result.current.orders.open();
    result.current.adder.form.setQuantity(5);
    result.current.adder.form.badOrder.selectReason("Custom");
  });
  act(() => result.current.adder.close());

  expect(result.current.adder.visible).toBe(false);
  expect(result.current.adder.form.quantity).toBe(0);
  expect(result.current.adder.form.badOrder.reasonType).toBeNull();
});
