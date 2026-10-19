"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Sends a deleted account back to /login, even while it still holds a token.
// getUser() asks Supabase Auth, so it returns no user once the account is gone.
// Call it at the start of a server action, or from a client component before
// an action that runs only in the browser.
export async function requireUser(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
}
