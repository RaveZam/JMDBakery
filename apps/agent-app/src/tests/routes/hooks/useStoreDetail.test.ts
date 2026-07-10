// Hook test: useStoreDetail looks a store up by id and exposes it (or null).
// The interesting branch is the `?? null` — a missing store must clear, not
// leave a stale value. The read-only service is mocked so nothing hits SQLite.
import { renderHook, act } from "@testing-library/react-native";

import { useStoreDetail } from "../useStoreDetail";
import { getStoreById } from "../../services/store-services";

jest.mock("../../services/store-services", () => ({ getStoreById: jest.fn() }));

const mockGetById = getStoreById as jest.Mock;
const STORE = { id: "s1", name: "Aling Nena", province_id: "p1" };

beforeEach(() => {
  jest.clearAllMocks();
});

test("openStore loads the store for the given id", () => {
  mockGetById.mockReturnValue(STORE);
  const { result } = renderHook(() => useStoreDetail());

  act(() => result.current.openStore("s1"));

  expect(mockGetById).toHaveBeenCalledWith("s1");
  expect(result.current.store).toEqual(STORE);
});

test("openStore sets null when the store is not found", () => {
  mockGetById.mockReturnValue(undefined);
  const { result } = renderHook(() => useStoreDetail());

  act(() => result.current.openStore("missing"));

  expect(result.current.store).toBeNull();
});

test("closeStore clears the open store", () => {
  mockGetById.mockReturnValue(STORE);
  const { result } = renderHook(() => useStoreDetail());

  act(() => result.current.openStore("s1"));
  act(() => result.current.closeStore());

  expect(result.current.store).toBeNull();
});
