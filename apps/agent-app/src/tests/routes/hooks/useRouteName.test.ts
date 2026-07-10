// Hook test: useRouteName's submit() decides WHETHER to persist a rename.
// The service (updateRouteName) already trims + rejects blanks in its own
// integration test; here we only assert the hook's guard logic — that it
// calls the service on a real change and stays silent otherwise — plus the
// modal/name state wiring. The service is mocked so nothing touches SQLite.
import { renderHook, act } from "@testing-library/react-native";

import { useRouteName } from "../useRouteName";
import { updateRouteName } from "../../services/route-save-service";
import { useLocalSearchParams } from "expo-router";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("../../services/route-save-service", () => ({
  updateRouteName: jest.fn(),
}));

const mockParams = useLocalSearchParams as jest.Mock;
const mockUpdate = updateRouteName as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockParams.mockReturnValue({ routeId: "r1", routeName: "North" });
});

test("persists a trimmed, changed name, updates the displayed name, and closes the modal", () => {
  const { result } = renderHook(() => useRouteName());

  act(() => result.current.rename.openModal());
  expect(result.current.rename.isModalOpen).toBe(true);

  act(() => result.current.rename.submit("  South  "));

  expect(mockUpdate).toHaveBeenCalledWith("r1", "South");
  expect(result.current.name).toBe("South");
  expect(result.current.rename.isModalOpen).toBe(false);
});

test("does not persist when the name is unchanged — just closes the modal", () => {
  const { result } = renderHook(() => useRouteName());

  act(() => result.current.rename.openModal());
  act(() => result.current.rename.submit("North")); // same as current name

  expect(mockUpdate).not.toHaveBeenCalled();
  expect(result.current.name).toBe("North");
  expect(result.current.rename.isModalOpen).toBe(false);
});

test("ignores a whitespace-only name", () => {
  const { result } = renderHook(() => useRouteName());

  act(() => result.current.rename.openModal());
  act(() => result.current.rename.submit("   "));

  expect(mockUpdate).not.toHaveBeenCalled();
  expect(result.current.rename.isModalOpen).toBe(false);
});

test("does not persist when routeId is missing from the params", () => {
  mockParams.mockReturnValue({ routeName: "North" }); // no routeId
  const { result } = renderHook(() => useRouteName());

  act(() => result.current.rename.submit("Totally New"));

  expect(mockUpdate).not.toHaveBeenCalled();
});

test("defaults the displayed name to 'Route' when no routeName param is given", () => {
  mockParams.mockReturnValue({ routeId: "r1" });
  const { result } = renderHook(() => useRouteName());

  expect(result.current.name).toBe("Route");
});
