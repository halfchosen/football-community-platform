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

  const generationRow = generation as unknown as { id: string } | null;
  const titleRow = title as unknown as { id: string } | null;

  return {
    generationId: generationRow?.id ?? null,
    titleId: titleRow?.id ?? null,
  };
}
