import { createClient } from "@/lib/supabase/server";

export async function getInitialIdentityDefaults() {
  const supabase = await createClient();

  const [{ data: generation }, { data: title }] = await Promise.all([
    supabase
      .from("generations")
      .select("id")
      .eq("slug", "first-generation-writer")
      .maybeSingle(),
    supabase.from("titles").select("id").eq("slug", "supporter").maybeSingle(),
  ]);

  return {
    generationId: generation?.id ?? null,
    titleId: title?.id ?? null,
  };
}
