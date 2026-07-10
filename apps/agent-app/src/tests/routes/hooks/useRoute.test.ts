// Hook test: useRoute holds the routes list + the create-modal and
// pending-delete state, and reloads the list after every mutation. We mock
// the save-service (no SQLite) and run useFocusEffect as a plain effect so the
// initial load fires. We assert the wiring: which service call each action
// makes and how state changes — including the confirmDelete no-op guard.
import { renderHook, act } from "@testing-library/react-native";

import { useRoute } from "../useRoute";
import {
  getRoutes,
  createRoute,
  deleteRoute,
} from "../../services/route-save-service";

// useFocusEffect only fires inside a navigator; here we make it behave like a
// mount effect so loadRoutes() runs once on render.
jest.mock("expo-router", () => ({
  useFocusEffect: (cb: () => void) => {
    const React = require("react");
    React.useEffect(cb, [cb]);
  },
}));
jest.mock("../../services/route-save-service", () => ({
  getRoutes: jest.fn(),
  createRoute: jest.fn(),
  deleteRoute: jest.fn(),
}));

const mockGet = getRoutes as jest.Mock;
const mockCreate = createRoute as jest.Mock;
const mockDelete = deleteRoute as jest.Mock;

const NORTH = { id: "r1", name: "North" };

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockReturnValue([]);
});

test("loads the routes on focus (mount)", () => {
  mockGet.mockReturnValue([NORTH]);

  const { result } = renderHook(() => useRoute());

  expect(mockGet).toHaveBeenCalled();
  expect(result.current.routes).toEqual([NORTH]);
});

test("addRoute creates the route then reloads the list", () => {
  const { result } = renderHook(() => useRoute());
  mockGet.mockReturnValue([NORTH]); // the list after the create
  act(() => result.current.create.addRoute("North"));
  expect(mockCreate).toHaveBeenCalledWith("North");
  expect(result.current.routes).toEqual([NORTH]);
});

test("confirmDelete deletes the pending route, clears it, and reloads", () => {
  mockGet.mockReturnValue([NORTH]);
  const { result } = renderHook(() => useRoute());
  act(() => result.current.del.requestDelete(NORTH));
  expect(result.current.del.routeToDelete).toEqual(NORTH);
  mockGet.mockReturnValue([]); // the list after the delete
  act(() => result.current.del.confirmDelete());
  expect(mockDelete).toHaveBeenCalledWith("r1");
  expect(result.current.del.routeToDelete).toBeNull();
  expect(result.current.routes).toEqual([]);
});

test("confirmDelete is a no-op when no route is pending", () => {
  const { result } = renderHook(() => useRoute());
  act(() => result.current.del.confirmDelete());
  expect(mockDelete).not.toHaveBeenCalled();
});

test("cancelDelete clears the pending route without deleting", () => {
  const { result } = renderHook(() => useRoute());
  act(() => result.current.del.requestDelete(NORTH));
  act(() => result.current.del.cancelDelete());
  expect(result.current.del.routeToDelete).toBeNull();
  expect(mockDelete).not.toHaveBeenCalled();
});

test("the create modal opens and closes", () => {
  const { result } = renderHook(() => useRoute());

  expect(result.current.create.isModalOpen).toBe(false);
  act(() => result.current.create.openModal());
  expect(result.current.create.isModalOpen).toBe(true);
  act(() => result.current.create.closeModal());
  expect(result.current.create.isModalOpen).toBe(false);
});
