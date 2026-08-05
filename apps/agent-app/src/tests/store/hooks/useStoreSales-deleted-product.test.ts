import { renderHook } from "@testing-library/react-native";
import { useStoreSales } from "@/src/features/store/hooks/useStoreSales";
import { getSalesByRouteSession } from "@/src/features/store/services/sales-services";

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({
    sessionId: "session-1",
    sessionStoreId: "ss-1",
  }),
}));

// Morning stock of Pandesal, loaded at ₱12 — the agent physically has it. No
// products-dao mock on purpose: an admin has since deleted the product, so the
// incremental pull removed the local row, and the hook must not need it.
jest.mock("@/src/lib/dao/session-inventory-dao", () => ({
  __esModule: true,
  default: {
    getBySessionId: () => [
      {
        inventoryId: "inv-1",
        productId: "p1",
        productName: "Pandesal",
        price: 12,
        qty: 10,
      },
    ],
  },
}));

jest.mock("@/src/features/store/services/sales-services");

jest.mock("@/src/features/store/services/store-services", () => ({
  getSessionStoreById: () => ({ store_province: null }),
}));

jest.mock("@/src/lib/dao/province-price-modifiers-dao", () => ({
  ProvincePriceModifiersDao: { getAllProvincePriceModifiers: () => [] },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (getSalesByRouteSession as jest.Mock).mockReturnValue([]);
});

test("prices a deleted product from the inventory snapshot, not ₱0", () => {
  const { result } = renderHook(() => useStoreSales());

  expect(result.current.adder.catalog.products).toEqual([
    { id: "p1", name: "Pandesal", price: 12 },
  ]);
});
