import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}
