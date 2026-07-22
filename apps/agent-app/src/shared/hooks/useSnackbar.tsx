import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Snackbar } from "@/src/shared/components/Snackbar";

const AUTO_HIDE_MS = 2500;

type SnackbarContextValue = {
  showSuccess: (message: string) => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/**
 * Mounts a single app-wide success snackbar and exposes `showSuccess` via
 * context. Mount once near the root (e.g. `app/_layout.tsx`) so any screen
 * can surface a success message without rendering its own snackbar.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuccess = useCallback((next: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setMessage(next);
    setVisible(true);
    hideTimer.current = setTimeout(() => setVisible(false), AUTO_HIDE_MS);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSuccess }}>
      {children}
      <Snackbar visible={visible} message={message} />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
}
