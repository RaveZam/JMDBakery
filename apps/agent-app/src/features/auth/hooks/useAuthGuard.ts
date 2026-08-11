import { useEffect, useRef, useState } from "react";
import { router, usePathname } from "expo-router";
import { readAuthGate } from "@/src/features/auth/services/authGate";
import {
  resolveAuthRedirect,
  isAuthAllowed,
} from "@/src/features/auth/core/resolveAuthRedirect";

export type AuthGuardState = {
  checking: boolean;
  allowed: boolean;
};

export function useAuthGuard(): AuthGuardState {
  const pathname = usePathname();
  // useRef so the "already downloaded" flag survives re-renders without
  // retriggering the effect.
  const downloaded = useRef(false);

  const [state, setState] = useState<AuthGuardState>({
    checking: true,
    allowed: false,
  });

  useEffect(() => {
    let mounted = true;

    readAuthGate(pathname, downloaded)
      .then((gate) => {
        if (!mounted) return;
        setState({ checking: false, allowed: isAuthAllowed(gate) });
        const target = resolveAuthRedirect(gate);
        if (target) router.replace(target);
      })
      .catch((error) => {
        console.warn("[useAuthGuard] auth check failed:", error);
        if (mounted) setState({ checking: false, allowed: false });
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return state;
}
