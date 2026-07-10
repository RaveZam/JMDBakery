import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { router } from "expo-router";
import {
  startSession,
  OngoingSessionExistsError,
} from "../../services/sessionLocalService";
import { useStartSession } from "../useStartSession";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({ routeId: "route-1", routeName: "Test Route" })),
  router: { replace: jest.fn() },
}));

jest.mock("../../services/sessionLocalService", () => {
  const actual = jest.requireActual("../../services/sessionLocalService");
  return { ...actual, startSession: jest.fn() };
});

const mockReplace = jest.mocked(router.replace);
const mockStartSession = jest.mocked(startSession);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
});

test("calls startSession and navigates to morning inventory on success", async () => {
  mockStartSession.mockResolvedValue("new-session-id");

  const { result } = renderHook(() => useStartSession());
  await act(async () => { await result.current.start(); });

  expect(mockStartSession).toHaveBeenCalledWith("route-1", "Test Route");
  expect(mockReplace).toHaveBeenCalledWith({
    pathname: "/main/routes/inventory",
    params: { routeId: "route-1", routeName: "Test Route", sessionId: "new-session-id" },
  });
});

test("shows alert when startSession throws (including no-stores case)", async () => {
  mockStartSession.mockRejectedValue(new Error("No stores on this route"));

  const { result } = renderHook(() => useStartSession());
  await act(async () => { await result.current.start(); });

  expect(Alert.alert).toHaveBeenCalledWith(
    "Couldn't start session",
    "Error: No stores on this route",
  );
  expect(mockReplace).not.toHaveBeenCalled();
});

test("shows alert when not authenticated", async () => {
  mockStartSession.mockRejectedValue(new Error("User not authenticated"));

  const { result } = renderHook(() => useStartSession());
  await act(async () => { await result.current.start(); });

  expect(Alert.alert).toHaveBeenCalledWith(
    "Couldn't start session",
    "Error: User not authenticated",
  );
});

test("shows the hard-block alert and does not navigate when a session is ongoing", async () => {
  mockStartSession.mockRejectedValue(new OngoingSessionExistsError());

  const { result } = renderHook(() => useStartSession());
  await act(async () => { await result.current.start(); });

  expect(Alert.alert).toHaveBeenCalledWith(
    "Session already running",
    expect.stringContaining("Cancel"),
  );
  expect(mockReplace).not.toHaveBeenCalled();
});

test("does nothing when routeId is missing", async () => {
  const { useLocalSearchParams } = require("expo-router");
  (useLocalSearchParams as jest.Mock).mockReturnValueOnce({ routeId: undefined, routeName: "Test" });

  const { result } = renderHook(() => useStartSession());
  await act(async () => { await result.current.start(); });

  expect(mockStartSession).not.toHaveBeenCalled();
});
