import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { router } from "expo-router";
import { runOutboxSync } from "@/src/lib/sync/outbox";
import { countPendingOutbox } from "@/src/lib/sync/pending-outbox-count";
import { signOutAndWipe } from "@/src/features/settings/services/signOutAndWipe";
import { useSignOut } from "@/src/features/settings/hooks/useSignOut";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("@/src/lib/sync/outbox", () => ({ runOutboxSync: jest.fn() }));
jest.mock("@/src/lib/sync/pending-outbox-count", () => ({ countPendingOutbox: jest.fn() }));
jest.mock("@/src/features/settings/services/signOutAndWipe", () => ({
  signOutAndWipe: jest.fn(),
}));

const mockReplace = jest.mocked(router.replace);
const mockRunOutboxSync = jest.mocked(runOutboxSync);
const mockCountPending = jest.mocked(countPendingOutbox);
const mockSignOutAndWipe = jest.mocked(signOutAndWipe);

/** Taps the button at `index` on the alert that was shown. */
function pressAlertButton(index: number): void {
  const buttons = jest.mocked(Alert.alert).mock.calls.at(-1)?.[2];
  buttons?.[index]?.onPress?.();
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  mockRunOutboxSync.mockResolvedValue(undefined as never);
  mockSignOutAndWipe.mockResolvedValue(undefined);
  mockCountPending.mockReturnValue(0);
});

test("pushes pending work before wiping", async () => {
  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });

  expect(mockRunOutboxSync).toHaveBeenCalled();
  expect(mockSignOutAndWipe).toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in");
});

test("signs out without a prompt when nothing is pending", async () => {
  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });

  expect(Alert.alert).not.toHaveBeenCalled();
});

test("still signs out when the push fails but everything got through earlier", async () => {
  mockRunOutboxSync.mockRejectedValue(new Error("offline"));

  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });

  expect(mockSignOutAndWipe).toHaveBeenCalled();
});

test("warns with the pending count instead of wiping straight away", async () => {
  mockCountPending.mockReturnValue(3);

  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });

  expect(mockSignOutAndWipe).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(
    "Unsynced records",
    expect.stringContaining("3"),
    expect.any(Array),
    expect.any(Object),
  );
});

test("wipes anyway once the agent confirms the warning", async () => {
  mockCountPending.mockReturnValue(3);

  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });
  await act(async () => { pressAlertButton(1); });

  expect(mockSignOutAndWipe).toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in");
});

test("keeps the data when the agent cancels the warning", async () => {
  mockCountPending.mockReturnValue(3);

  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });
  await act(async () => { pressAlertButton(0); });

  expect(mockSignOutAndWipe).not.toHaveBeenCalled();
  expect(result.current.loading).toBe(false);
});

test("reports a failed sign out and stays put", async () => {
  mockSignOutAndWipe.mockRejectedValue(new Error("network down"));

  const { result } = renderHook(() => useSignOut());
  await act(async () => { await result.current.signOut(); });

  expect(mockReplace).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith("Sign out failed", expect.any(String));
  expect(result.current.loading).toBe(false);
});
