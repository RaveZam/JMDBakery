// Hook test: useProvinces loads the provinces for the routeId param. The guard
// (`if (!routeId) return`) must keep it from querying with no route. The
// read-only service and the router param are both mocked.
import { renderHook, act } from "@testing-library/react-native";

import { useProvinces } from "./useProvinces";
import { getProvinces } from "../services/province-save-service";
import { useLocalSearchParams } from "expo-router";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("../services/province-save-service", () => ({
  getProvinces: jest.fn(),
}));

const mockParams = useLocalSearchParams as jest.Mock;
const mockGet = getProvinces as jest.Mock;

const BULACAN = { id: "p1", name: "Bulacan", route_id: "r1" };

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockReturnValue([]);
});

test("loads the provinces for the routeId on mount", () => {
  mockParams.mockReturnValue({ routeId: "r1" });
  mockGet.mockReturnValue([BULACAN]);

  const { result } = renderHook(() => useProvinces());

  expect(mockGet).toHaveBeenCalledWith("r1");
  expect(result.current.provinces).toEqual([BULACAN]);
});

test("does not query when there is no routeId", () => {
  mockParams.mockReturnValue({});

  const { result } = renderHook(() => useProvinces());

  expect(mockGet).not.toHaveBeenCalled();
  expect(result.current.provinces).toEqual([]);
});

test("loadProvinces re-fetches the current list on demand", () => {
  mockParams.mockReturnValue({ routeId: "r1" });
  const { result } = renderHook(() => useProvinces());

  mockGet.mockReturnValue([BULACAN]); // a province was added elsewhere
  act(() => result.current.loadProvinces());

  expect(result.current.provinces).toEqual([BULACAN]);
});
