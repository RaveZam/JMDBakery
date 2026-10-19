import { createClient } from "@/utils/supabase/client";

// Falls back to the email when the account has no name set.
export async function getUserName() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (user?.user_metadata?.name as string) || user?.email;
}
