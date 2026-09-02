import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { supabase } from "@/src/lib/supabase";
import { clearDeviceTrust } from "@/src/lib/device-trust";
import { runDownloadSync } from "@/src/lib/sync/download";
import useLogin from "@/src/features/auth/hooks/useLogin";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: (): { replace: jest.Mock } => ({ replace: mockReplace }),
}));
jest.mock("@/src/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));
jest.mock("@/src/lib/device-trust", () => ({ clearDeviceTrust: jest.fn() }));
jest.mock("@/src/lib/sync/download", () => ({ runDownloadSync: jest.fn() }));

const mockSignIn = jest.mocked(supabase.auth.signInWithPassword);
const mockSignOut = jest.mocked(supabase.auth.signOut);
const mockClearTrust = jest.mocked(clearDeviceTrust);
const mockRunDownloadSync = jest.mocked(runDownloadSync);

/** Shapes what signInWithPassword resolves to for a given account role. */
function signInResult(role: string | undefined): never {
  return {
    data: { user: { user_metadata: role ? { role } : {} }, session: {} },
    error: null,
  } as never;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
  mockRunDownloadSync.mockResolvedValue(undefined);
});

test("pulls reference data before landing on the home screen", async () => {
  mockSignIn.mockResolvedValue(signInResult("agent"));

  const { result } = renderHook(() => useLogin("agent@jmd.test", "secret"));
  await act(async () => {
    await result.current.handleSignIn();
  });

  expect(mockRunDownloadSync).toHaveBeenCalled();
  expect(mockReplace).toHaveBeenCalledWith("/");
  const syncOrder = mockRunDownloadSync.mock.invocationCallOrder[0];
  const navOrder = mockReplace.mock.invocationCallOrder[0];
  expect(syncOrder).toBeLessThan(navOrder);
});

test("still navigates home when the sync fails", async () => {
  mockSignIn.mockResolvedValue(signInResult("agent"));
  mockRunDownloadSync.mockRejectedValue(new Error("offline"));

  const { result } = renderHook(() => useLogin("agent@jmd.test", "secret"));
  await act(async () => {
    await result.current.handleSignIn();
  });

  expect(mockReplace).toHaveBeenCalledWith("/");
});

test("does not sync when the account is not an agent", async () => {
  mockSignIn.mockResolvedValue(signInResult("admin"));

  const { result } = renderHook(() => useLogin("agent@jmd.test", "secret"));
  await act(async () => {
    await result.current.handleSignIn();
  });

  expect(mockSignOut).toHaveBeenCalled();
  expect(mockClearTrust).toHaveBeenCalled();
  expect(mockRunDownloadSync).not.toHaveBeenCalled();
  expect(mockReplace).not.toHaveBeenCalled();
});

test("does not sync when sign in is rejected", async () => {
  mockSignIn.mockResolvedValue({
    data: { user: null, session: null },
    error: { message: "bad password" },
  } as never);

  const { result } = renderHook(() => useLogin("agent@jmd.test", "secret"));
  await act(async () => {
    await result.current.handleSignIn();
  });

  expect(mockRunDownloadSync).not.toHaveBeenCalled();
});

test("reports syncing while the pull is in flight", async () => {
  mockSignIn.mockResolvedValue(signInResult("agent"));
  let releaseSync = (): void => {};
  mockRunDownloadSync.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        releaseSync = (): void => resolve();
      }),
  );

  const { result } = renderHook(() => useLogin("agent@jmd.test", "secret"));
  let pending: Promise<void> = Promise.resolve();
  await act(async () => {
    pending = result.current.handleSignIn();
  });

  expect(result.current.syncing).toBe(true);

  await act(async () => {
    releaseSync();
    await pending;
  });

  expect(result.current.syncing).toBe(false);
});
