import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export default function useLogin(email: string, password: string) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  return async function handleSignIn(): Promise<void> {
    setLoading(true);
    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (res.error) {
        Alert.alert("Sign in failed", res.error.message);
        return;
      }
      if (res.data.user?.user_metadata?.role !== "agent") {
        await supabase.auth.signOut();
        Alert.alert("Access denied", "This account is not an agent.");
        return;
      }
      // on success navigate to main index
      router.replace("/");
    } catch (error: unknown) {
      Alert.alert("Sign in failed", String(error));
    } finally {
      setLoading(false);
    }
  };
}
