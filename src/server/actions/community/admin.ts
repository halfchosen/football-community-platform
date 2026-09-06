"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { CommunityActionResult } from "./actions";
export async function manageMember(
  _state: CommunityActionResult,
  form: FormData,
): Promise<CommunityActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("community_manage_member", {
    p_user: String(form.get("userId")),
    p_action: String(form.get("operation")),
    p_reason: String(form.get("reason") ?? "").trim(),
  });
  if (error)
    return {
      ok: false,
      message:
        error.code === "P0001"
          ? error.message
          : "The change could not be saved. Check your permissions.",
    };
  revalidatePath("/admin/members");
  revalidatePath("/", "layout");
  return { ok: true, message: "Decision recorded and the member notified." };
}
export async function configureWave(
  _state: CommunityActionResult,
  form: FormData,
): Promise<CommunityActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("community_configure_wave", {
    p_name: String(form.get("name") ?? ""),
    p_capacity: Number(form.get("capacity")),
    p_club_capacity: Number(form.get("clubCapacity")),
    p_open: form.get("open") === "on",
    p_new: form.get("newWave") === "on",
  });
  if (error)
    return {
      ok: false,
      message:
        error.code === "P0001"
          ? error.message
          : "Admission settings could not be saved. Administrator access is required.",
    };
  revalidatePath("/admin/members");
  revalidatePath("/community");
  revalidatePath("/onboarding");
  return {
    ok: true,
    message:
      "Admission updated. Existing generations and places are preserved.",
  };
}
