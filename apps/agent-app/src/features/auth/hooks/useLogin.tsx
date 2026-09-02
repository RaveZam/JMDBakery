import { supabase } from "@/src/lib/supabase";
import { clearDeviceTrust } from "@/src/lib/device-trust";
import { runDownloadSync } from "@/src/lib/sync/download";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

type LoginController = {
  handleSignIn: () => Promise<void>;
  loading: boolean;
  syncing: boolean;
};

export default function useLogin(
  email: string,
  password: string,
): LoginController {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  async function handleSignIn(): Promise<void> {
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        Alert.alert("Sign in failed", res.error.message);
        return;
      }
      if (res.data.user?.user_metadata?.role !== "agent") {
        await supabase.auth.signOut();
        clearDeviceTrust();
        Alert.alert("Access denied", "This account is not an agent.");
        return;
      }
      // Pull products, stores and store credit before the home screen mounts,
      // so the agent doesn't have to reload the app to see them. A failed pull
      // still lets them in — the sync scheduler retries once online.
      setSyncing(true);
      await runDownloadSync().catch((error: unknown) => {
        console.warn("[useLogin] initial download sync failed:", error);
      });
      setSyncing(false);
      router.replace("/");
    } catch (error: unknown) {
      Alert.alert("Sign in failed", String(error));
    } finally {
      setLoading(false);
    }
  }

  return { handleSignIn, loading, syncing };
}
