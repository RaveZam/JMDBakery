"use server";

import { createClient } from "@/utils/supabase/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/app/server/auth/requireAdmin";

type CreateAgentInput = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
};

export async function createAgent(input: CreateAgentInput) {
  await requireAdmin();
  const supabase = await createClient();
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    // The role we trust. Users can edit user_metadata but not app_metadata.
    app_metadata: { role: "agent" },
    user_metadata: {
      role: "agent",
      name: input.name,
    },
  });

  if (error) throw new Error(error.message);

  return { userId: data.user?.id };
}
