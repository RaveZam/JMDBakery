import { renderHook, act } from "@testing-library/react-native";
import { useInventory } from "@/src/features/inventory/hooks/useInventory";
import { cancelSession } from "@/src/features/sessions/services/sessionLocalService";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({ sessionId: "session-1", routeName: "Route 1" }),
}));

jest.mock("@/src/features/sessions/services/sessionLocalService", () => ({
  cancelSession: jest.fn(),
}));

jest.mock("@/src/features/inventory/hooks/useProducts", () => ({
  useProducts: () => ({ products: [] }),
}));

jest.mock("@/src/lib/dao/session-inventory-dao", () => ({
  __esModule: true,
  default: { getBySessionId: () => [] },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("cancelInventorySession cancels the session and navigates to the routes list", () => {
  const { router } = require("expo-router");
  const { result } = renderHook(() => useInventory());

  act(() => {
    result.current.inventory.cancelInventorySession();
  });

  expect(cancelSession).toHaveBeenCalledWith("session-1");
  expect(router.replace).toHaveBeenCalledWith("/main/routes");
});
