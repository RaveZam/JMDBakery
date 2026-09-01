// The whole path across two features, against the real SQLite engine: a
// payment recorded on a visit the way the store screen records it has to reach
// the session detail the way the history screen reads it. The pieces each have
// their own tests; this catches the two halves drifting apart — the payment
// carries the visit in session_store_id, which is what ties them.
import { renderHook } from "@testing-library/react-native";
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
import SalesDao from "@/src/lib/dao/sales-dao";
import { syncVisitCredit, recordStorePayment } from "@/src/features/store/services/store-credit-service";
import { useHistorySession } from "@/src/features/history/hooks/useHistorySession";
import { useLocalSearchParams } from "expo-router";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@/src/features/history/services/cancel-session-service", () => ({
  cancelHistorySession: jest.fn(),
}));

beforeAll(async () => { await createSchema(); });
beforeEach(() => resetDb());

test("a payment recorded on a visit shows up in that session's detail", () => {
  const routeId = seedRoute();
  const provinceId = seedProvince(routeId);
  const storeId = seedStore(provinceId);
  const sessionId = seedRouteSession();
  const sessionStoreId = seedSessionStore(sessionId, storeId, provinceId);
  const productId = seedProduct();

  SalesDao.insertSale({
    id: "sale-1",
    sessionStoreId,
    productId,
    snapshotName: "Pandesal",
    snapshotPrice: 100,
    quantitySold: 10,
    quantityBo: 0,
    boReason: "",
    paymentType: "credit",
    createdAt: "2026-06-30T01:00:00.000Z",
  });
  syncVisitCredit(sessionStoreId);
  recordStorePayment({ sessionStoreId, amount: 400 });

  (useLocalSearchParams as jest.Mock).mockReturnValue({ sessionId });
  const { result } = renderHook(() => useHistorySession());

  expect(result.current.session.paymentsByStore[sessionStoreId]).toHaveLength(1);
  expect(result.current.session.collectedTotal).toBe(400);
});
