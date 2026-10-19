import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Sends anyone who isn't a signed-in admin back to /login. getUser() asks
// Supabase Auth, so a deleted account fails too. Call it first in any server
// action that uses the service role key, since that key skips RLS.
export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") redirect("/login");
}
