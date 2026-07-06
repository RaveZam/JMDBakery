import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useStartSession } from "../useStartSession";
import {
  startSession,
  OngoingSessionExistsError,
} from "../../services/sessionLocalService";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({ routeId: "r1", routeName: "Route 1" }),
}));

jest.mock("../../services/sessionLocalService", () => {
  const actual = jest.requireActual("../../services/sessionLocalService");
  return {
    ...actual,
    startSession: jest.fn(),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

test("shows a block alert and does not navigate when a session is ongoing", async () => {
  const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  (startSession as jest.Mock).mockRejectedValueOnce(
    new OngoingSessionExistsError(),
  );
  const { router } = require("expo-router");

  const { result } = renderHook(() => useStartSession());
  await act(async () => {
    await result.current.start();
  });

  expect(alertSpy).toHaveBeenCalledWith(
    "Session already running",
    expect.stringContaining("Cancel"),
  );
  expect(router.replace).not.toHaveBeenCalled();
});

test("navigates to inventory on a successful start", async () => {
  (startSession as jest.Mock).mockResolvedValueOnce("session-1");
  const { router } = require("expo-router");

  const { result } = renderHook(() => useStartSession());
  await act(async () => {
    await result.current.start();
  });

  expect(router.replace).toHaveBeenCalledWith({
    pathname: "/main/routes/inventory",
    params: { routeId: "r1", routeName: "Route 1", sessionId: "session-1" },
  });
});
