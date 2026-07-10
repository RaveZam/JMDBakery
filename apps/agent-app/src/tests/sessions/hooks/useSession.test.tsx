import { renderHook, act } from "@testing-library/react-native";
import { useSession } from "../useSession";
import { cancelSession } from "../../services/sessionLocalService";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useFocusEffect: () => {},
  useLocalSearchParams: () => ({ sessionId: "session-1" }),
}));

jest.mock("../../services/sessionLocalService", () => {
  const actual = jest.requireActual("../../services/sessionLocalService");
  return { ...actual, cancelSession: jest.fn(), completeSession: jest.fn() };
});

beforeEach(() => {
  jest.clearAllMocks();
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
