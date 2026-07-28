// Hook test against the real SQLite engine: useHistorySession assembles one
// session's detail (row, inventory, stores, per-store sales, ending-inventory
// flag) from five DAOs, so seeding real rows beats a wall of DAO mocks. Only
// the edges are faked: expo-router (params + back navigation), the cancel
// service (it has its own integration test), and Alert.
import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  createSchema,
  resetDb,
  seedRoute,
  seedProvince,
  seedStore,
  seedRouteSession,
  seedSessionStore,
  seedProduct,
} from "@/src/test-utils/db-test-helpers";
import SessionInventoryDao from "@/src/lib/dao/session-inventory-dao";
import SalesDao from "@/src/lib/dao/sales-dao";
import EndingInventoryDao from "@/src/lib/dao/ending-inventory-dao";
import { useHistorySession } from "@/src/features/history/hooks/useHistorySession";
import { cancelHistorySession } from "@/src/features/history/services/cancel-session-service";
import { useLocalSearchParams } from "expo-router";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/src/features/history/services/cancel-session-service", () => ({
  cancelHistorySession: jest.fn(),
}));

const mockParams = useLocalSearchParams as jest.Mock;
const alertSpy = jest.spyOn(Alert, "alert");

beforeAll(async () => { await createSchema(); });
beforeEach(() => {
  resetDb();
  jest.clearAllMocks();
});

/** Seed a full session detail: one store with one sale, one inventory item. */
function seedSessionDetail() {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = seedRouteSession();
  const sessionStoreId = seedSessionStore(sessionId, storeId, provinceId);

  const productId = seedProduct();
  SessionInventoryDao.insert({
    sessionId,
    productId,
    snapshotName: "Pandesal",
    snapshotPrice: 10,
    quantity: 20,
    createdAt: "2026-06-30T00:00:00.000Z",
  });
  SalesDao.insertSale({
    id: "sale-1",
    sessionStoreId,
    productId,
    snapshotName: "Pandesal",
    snapshotPrice: 10,
    quantitySold: 5,
    quantityBo: 0,
    boReason: "",
    createdAt: "2026-06-30T01:00:00.000Z",
  });

  return { sessionId, sessionStoreId, productId };
}

test("assembles the session row, inventory, stores, and per-store sales", () => {
  const { sessionId, sessionStoreId } = seedSessionDetail();
  mockParams.mockReturnValue({ sessionId });

  const { result } = renderHook(() => useHistorySession());
  const { session } = result.current;

  expect(session.sessionId).toBe(sessionId);
  expect(session.data?.id).toBe(sessionId);
  expect(session.isOngoing).toBe(true); // seeded sessions start ongoing
  expect(session.inventory).toHaveLength(1);
  expect(session.inventory[0]).toMatchObject({ productName: "Pandesal", qty: 20 });
  expect(session.stores).toHaveLength(1);
  expect(session.salesByStore[sessionStoreId]).toHaveLength(1);
  expect(session.salesByStore[sessionStoreId][0]).toMatchObject({
    productName: "Pandesal",
    price: 10,
    qty: 5,
  });
  expect(session.hasEndingInventory).toBe(false);
});

test("reports ending inventory once the session has ending rows", () => {
  const { sessionId, productId } = seedSessionDetail();
  EndingInventoryDao.upsert({
    sessionId,
    productId,
    snapshotName: "Pandesal",
    quantity: 15,
    createdAt: "2026-06-30T18:00:00.000Z",
  });
  mockParams.mockReturnValue({ sessionId });

  const { result } = renderHook(() => useHistorySession());

  expect(result.current.session.hasEndingInventory).toBe(true);
});

test("confirmCancel asks first; confirming cancels the session and navigates back", () => {
  const { router } = require("expo-router");
  const { sessionId } = seedSessionDetail();
  mockParams.mockReturnValue({ sessionId });

  const { result } = renderHook(() => useHistorySession());
  act(() => result.current.session.actions.confirmCancel());

  // Nothing happens until the user confirms in the alert.
  expect(cancelHistorySession).not.toHaveBeenCalled();

  const buttons = alertSpy.mock.calls[0][2]!;
  const destructive = buttons.find((b) => b.style === "destructive")!;
  act(() => destructive.onPress!());

  expect(cancelHistorySession).toHaveBeenCalledWith(sessionId);
  expect(router.back).toHaveBeenCalled();
});

test("returns empty data and a no-op confirmCancel without a sessionId param", () => {
  mockParams.mockReturnValue({});

  const { result } = renderHook(() => useHistorySession());
  const { session } = result.current;

  expect(session.data).toBeNull();
  expect(session.inventory).toEqual([]);
  expect(session.stores).toEqual([]);
  expect(session.isOngoing).toBe(false);

  act(() => session.actions.confirmCancel());
  expect(alertSpy).not.toHaveBeenCalled();
});
