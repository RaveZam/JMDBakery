import { createClient } from "@/utils/supabase/client";

export async function getUserEmail() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email;
}
