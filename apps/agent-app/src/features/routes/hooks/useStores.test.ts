// Hook test: useStores loads the stores for a provinceId prop. The guard
// (`if (!provinceId) return`) must keep it from querying with an empty id.
// The read-only service is mocked.
import { renderHook } from "@testing-library/react-native";

import { useStores } from "./useStores";
import { getStoresForProvince } from "../services/store-services";

jest.mock("../services/store-services", () => ({
  getStoresForProvince: jest.fn(),
}));

const mockGet = getStoresForProvince as jest.Mock;
const STORE = { id: "s1", name: "Aling Nena", province_id: "p1" };

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockReturnValue([]);
});

test("loads the stores for the provinceId on mount", () => {
  mockGet.mockReturnValue([STORE]);

  const { result } = renderHook(() => useStores("p1"));

  expect(mockGet).toHaveBeenCalledWith("p1");
  expect(result.current.stores).toEqual([STORE]);
});

test("does not query when the provinceId is empty", () => {
  const { result } = renderHook(() => useStores(""));

  expect(mockGet).not.toHaveBeenCalled();
  expect(result.current.stores).toEqual([]);
});
