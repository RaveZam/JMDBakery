import { useEffect, useState } from "react";
import { router } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@/src/lib/supabase";

// Redirects away from the sign-in screen once a valid session is found, and
// tracks connectivity so the screen can tell "genuinely signed out" apart
// from "token refresh failed offline". Re-checks the session as soon as
// connectivity returns so a reconnecting agent isn't stuck re-entering
// credentials unnecessarily.
export default function useSessionRedirect(): boolean {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted && data?.session) {
          router.replace("/");
        }
      } catch {
        // ignore - we'll show the auth screen
      }
    };

    checkSession();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!mounted) return;
      const connected =
        state.isConnected === true && state.isInternetReachable !== false;
      setOffline(!connected);
      if (connected) checkSession();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return offline;
}
