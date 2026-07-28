import { renderHook, act } from "@testing-library/react-native";
import { useSession } from "@/src/features/sessions/hooks/useSession";
import { cancelSession } from "@/src/features/sessions/services/sessionLocalService";
import RouteSessionsDao from "@/src/lib/dao/route-sessions-dao";
import SessionStoresDao from "@/src/lib/dao/session-stores-dao";
import type { SessionStore } from "@/src/features/sessions/types/session-types";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  // Run the focus callback like a mounted screen would, so the hook loads its stores.
  // React is required inside the factory because jest.mock forbids outer-scope references.
  useFocusEffect: (callback: () => void) =>
    require("react").useEffect(callback, [callback]),
  useLocalSearchParams: () => ({ sessionId: "session-1" }),
}));

jest.mock("@/src/features/sessions/services/sessionLocalService", () => {
  const actual = jest.requireActual("@/src/features/sessions/services/sessionLocalService");
  return { ...actual, cancelSession: jest.fn(), completeSession: jest.fn() };
});

jest.mock("@/src/lib/dao/route-sessions-dao", () => ({
  __esModule: true,
  default: { getById: jest.fn() },
}));

jest.mock("@/src/lib/dao/session-stores-dao", () => ({
  __esModule: true,
  default: { getBySessionId: jest.fn() },
}));

function store(overrides: Partial<SessionStore>): SessionStore {
  return {
    id: "s1",
    route_session_id: "session-1",
    store_id: "store1",
    store_name: "Store",
    store_province: null,
    store_city: null,
    store_barangay: null,
    store_contact_name: null,
    province_name: null,
    visited: 0,
    created_at: "2026-07-03",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  (RouteSessionsDao.getById as jest.Mock).mockReturnValue(null);
  (SessionStoresDao.getBySessionId as jest.Mock).mockReturnValue([]);
});

test("cancelRoute cancels the session and navigates to the routes list", () => {
  const { router } = require("expo-router");
  const { result } = renderHook(() => useSession());

  act(() => {
    result.current.session.actions.cancelRoute();
  });

  expect(cancelSession).toHaveBeenCalledWith("session-1");
  expect(router.push).toHaveBeenCalledWith("/main/routes");
});

test("a search narrows the sections and drops provinces with no match", () => {
  (SessionStoresDao.getBySessionId as jest.Mock).mockReturnValue([
    store({ id: "a", store_name: "Lucky Mart", province_name: "Cagayan" }),
    store({ id: "b", store_name: "Aling Nena", province_name: "Cagayan" }),
    store({ id: "c", store_name: "Blue Store", province_name: "Isabela" }),
  ]);

  const { result } = renderHook(() => useSession());

  expect(result.current.session.sections.map((s) => s.title)).toEqual([
    "Cagayan",
    "Isabela",
  ]);

  act(() => {
    result.current.session.actions.setSearchQuery("lucky");
  });

  const sections = result.current.session.sections;
  expect(sections.map((s) => s.title)).toEqual(["Cagayan"]);
  expect(sections[0].data.map((s) => s.id)).toEqual(["a"]);
});

test("progress keeps counting the whole session while a search is active", () => {
  (SessionStoresDao.getBySessionId as jest.Mock).mockReturnValue([
    store({ id: "a", store_name: "Lucky Mart", visited: 1 }),
    store({ id: "b", store_name: "Aling Nena", visited: 0 }),
    store({ id: "c", store_name: "Blue Store", visited: 0 }),
  ]);

  const { result } = renderHook(() => useSession());

  act(() => {
    result.current.session.actions.setSearchQuery("lucky");
  });

  expect(result.current.session.sections[0].data).toHaveLength(1);
  expect(result.current.session.progress.visited).toBe(1);
  expect(result.current.session.progress.total).toBe(3);
});

test("clearing the search restores every store", () => {
  (SessionStoresDao.getBySessionId as jest.Mock).mockReturnValue([
    store({ id: "a", store_name: "Lucky Mart" }),
    store({ id: "b", store_name: "Blue Store" }),
  ]);

  const { result } = renderHook(() => useSession());

  act(() => {
    result.current.session.actions.setSearchQuery("lucky");
  });
  act(() => {
    result.current.session.actions.setSearchQuery("");
  });

  expect(result.current.session.sections[0].data.map((s) => s.id)).toEqual([
    "a",
    "b",
  ]);
});
