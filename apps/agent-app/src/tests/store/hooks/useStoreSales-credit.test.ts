import {
  renderHook,
  act,
  type RenderHookResult,
} from "@testing-library/react-native";
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

// How an order is settled is a field on the order, so one stop can mix cash and
// credit. These tests cover that field reaching the sale; reconciling the debt
// from it belongs to sales-services, and is covered against a real DB in
// store-credit-service.test.ts. The rest of the hook lives in
// useStoreSales.test.ts.

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({
    sessionId: "session-1",
    sessionStoreId: "ss-1",
  }),
}));

// Morning truck stock: 10 Pandesal at ₱10.
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

jest.mock("@/src/features/store/services/store-services", () => ({
  getSessionStoreById: () => ({ store_province: null }),
}));

jest.mock("@/src/lib/dao/province-price-modifiers-dao", () => ({
  ProvincePriceModifiersDao: { getAllProvincePriceModifiers: () => [] },
}));

const PANDESAL = { id: "p1", name: "Pandesal", price: 10 };

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
  jest.clearAllMocks();
  mockedByRoute.mockReturnValue([]);
  mockedByStore.mockReturnValue([]);
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

/** Render with a product selected and the toggle on `paymentType`. */
function renderReadyToOrder(
  paymentType: "cash" | "credit",
): RenderHookResult<ReturnType<typeof useStoreSales>, unknown> {
  const rendered = renderHook(() => useStoreSales());
  act(() => {
    rendered.result.current.adder.payment.setType(paymentType);
    rendered.result.current.adder.catalog.select(PANDESAL);
  });
  return rendered;
}

test("an order logged on credit is saved as a credit order", () => {
  const { result } = renderReadyToOrder("credit");

  act(() => result.current.adder.form.setQuantity(3));
  act(() => result.current.adder.submit());

  expect(addSale).toHaveBeenCalledWith(
    expect.objectContaining({ qty: 3, paymentType: "credit" }),
  );
});

test("an order logged on cash is saved as a cash order", () => {
  const { result } = renderReadyToOrder("cash");

  act(() => result.current.adder.form.setQuantity(3));
  act(() => result.current.adder.submit());

  expect(addSale).toHaveBeenCalledWith(
    expect.objectContaining({ paymentType: "cash" }),
  );
});

test("the toggle returns to cash after an order, so credit is never assumed", () => {
  const { result } = renderReadyToOrder("credit");

  act(() => result.current.adder.form.setQuantity(3));
  act(() => result.current.adder.submit());

  expect(result.current.adder.payment.type).toBe("cash");
});

test("closing the modal also drops a half-set credit choice", () => {
  const { result } = renderReadyToOrder("credit");

  act(() => result.current.adder.close());

  expect(result.current.adder.payment.type).toBe("cash");
});

test("editing a credit order reopens on credit, not the cash default", () => {
  mockedByStore.mockReturnValue([makeSold({ paymentType: "credit" })]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.orders.onItemPress(0));

  expect(result.current.adder.payment.type).toBe("credit");
});

test("editing a credit order down to cash saves it as cash", () => {
  mockedByStore.mockReturnValue([makeSold({ paymentType: "credit" })]);
  mockedByRoute.mockReturnValue([makeSold({ paymentType: "credit" })]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.orders.onItemPress(0));
  act(() => result.current.adder.payment.setType("cash"));
  act(() => result.current.adder.submit());

  expect(updateSale).toHaveBeenCalledWith(
    expect.objectContaining({ saleId: "sale-1", paymentType: "cash" }),
  );
});

test("a rejected order writes nothing, so the debt is left alone", () => {
  const { result } = renderReadyToOrder("credit");

  act(() => result.current.adder.form.setQuantity(11)); // only 10 stocked
  act(() => result.current.adder.submit());

  expect(addSale).not.toHaveBeenCalled();
});

test("deleting an order removes the sale it was recorded as", () => {
  mockedByStore.mockReturnValue([makeSold({ paymentType: "credit" })]);
  const { result } = renderHook(() => useStoreSales());

  act(() => result.current.orders.onDeleteItem(0));
  const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
  act(() =>
    buttons.find((b: { style: string }) => b.style === "destructive").onPress(),
  );

  expect(removeSale).toHaveBeenCalledWith("sale-1");
});
