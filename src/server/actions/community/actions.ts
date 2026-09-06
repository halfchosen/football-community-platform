"use server";

import { isCommunityLaunchReady } from "@/lib/community/legal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  COMMUNITY_POLICY,
  REPORT_REASONS,
  communityError,
} from "@/domains/community/policy";
import { requireOnboardingComplete, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export type CommunityActionResult = { ok: boolean; message: string } | null;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function manageContent(
  _state: CommunityActionResult,
  form: FormData,
): Promise<CommunityActionResult> {
  await requireUser();
  const id = String(form.get("id") ?? "");
  const kind = String(form.get("kind") ?? "");
  const action = String(form.get("operation") ?? "");
  if (
    !uuid.test(id) ||
    !["entry", "comment"].includes(kind) ||
    !["delete", "restore", "purge"].includes(action)
  )
    return { ok: false, message: "Invalid content action." };
  if (action === "purge" && form.get("confirmed") !== "on")
    return { ok: false, message: "Confirm permanent deletion first." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("manage_community_content", {
    p_kind: kind,
    p_id: id,
    p_action: action,
  });
  if (error) return { ok: false, message: communityError(error.message) };
  revalidatePath("/");
  revalidatePath("/me/activity");
  revalidatePath("/u", "layout");
  return {
    ok: true,
    message:
      action === "restore"
        ? "Post restored."
        : action === "purge"
          ? "Post permanently erased."
          : "Moved to Recently deleted. You have 30 days to restore it.",
  };
}

export async function reportContent(
  _state: CommunityActionResult,
  form: FormData,
): Promise<CommunityActionResult> {
  await requireOnboardingComplete();
  const id = String(form.get("id") ?? "");
  const kind = String(form.get("kind") ?? "");
  const reason = String(form.get("reason") ?? "");
  const details = String(form.get("details") ?? "").trim();
  if (
    !uuid.test(id) ||
    !["entry", "comment"].includes(kind) ||
    !(reason in REPORT_REASONS) ||
    details.length < 10 ||
    details.length > 2000
  )
    return {
      ok: false,
      message: "Choose a reason and add 10–2000 characters of context.",
    };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("report_community_content", {
    p_kind: kind,
    p_id: id,
    p_reason: reason,
    p_details: details,
  });
  if (error) return { ok: false, message: communityError(error.message) };
  revalidatePath("/me/reports");
  revalidatePath("/admin/reports");
  return {
    ok: true,
    message: `Report received. Reference ${String(data).slice(0, 8)}. You can follow its progress in My reports.`,
  };
}

export async function saveTopic(
  topicId: string,
  saved: boolean,
): Promise<CommunityActionResult> {
  await requireOnboardingComplete();
  if (!uuid.test(topicId)) return { ok: false, message: "Invalid topic." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_community_topic", {
    p_id: topicId,
    p_saved: saved,
  });
  if (error) return { ok: false, message: communityError(error.message) };
  revalidatePath("/me/saved");
  return {
    ok: true,
    message: saved ? "Topic saved." : "Removed from saved topics.",
  };
}

export async function acceptAgreements(form: FormData) {
  if (process.env.NODE_ENV === "production" && !isCommunityLaunchReady())
    redirect(
      "/agreements?error=Our launch policies are still being finalised.",
    );
  await requireUser();
  if (
    form.get("terms") !== "on" ||
    form.get("privacy") !== "on" ||
    form.get("rules") !== "on"
  )
    redirect("/agreements?error=Please review all three documents.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_community_agreements", {
    p_terms: COMMUNITY_POLICY.termsVersion,
    p_privacy: COMMUNITY_POLICY.privacyVersion,
    p_rules: COMMUNITY_POLICY.rulesVersion,
  });
  if (error)
    redirect("/agreements?error=Your agreement could not be saved. Try again.");
  revalidatePath("/", "layout");
  redirect("/");
}

export async function recoverAccount(
  _state: CommunityActionResult,
  _form: FormData,
): Promise<CommunityActionResult> {
  void _state;
  void _form;
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("community_account_lifecycle", {
    p_action: "recover",
  });
  if (error) return { ok: false, message: communityError(error.message) };
  revalidatePath("/", "layout");
  redirect("/");
}

export async function markNotificationsRead() {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("read_community_notifications");
  if (error) throw new Error("Notifications could not be marked as read.");
  revalidatePath("/me/notifications");
}

export async function resolveReport(
  _state: CommunityActionResult,
  form: FormData,
): Promise<CommunityActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("resolve_community_report", {
    p_id: String(form.get("id")),
    p_action: String(form.get("operation")),
    p_reason: String(form.get("reason")),
  });
  if (error)
    return {
      ok: false,
      message:
        "The decision could not be saved. Check your permissions and enter a clear reason.",
    };
  revalidatePath("/admin/reports");
  revalidatePath("/");
  return { ok: true, message: "Decision recorded and members notified." };
}

export async function appealReport(
  _state: CommunityActionResult,
  form: FormData,
): Promise<CommunityActionResult> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("appeal_community_report", {
    p_id: String(form.get("id")),
    p_reason: String(form.get("reason")),
  });
  if (error)
    return {
      ok: false,
      message:
        "The appeal could not be submitted. Check eligibility and add at least 10 characters.",
    };
  revalidatePath("/me/reports");
  return {
    ok: true,
    message: "Your appeal has been added to the review queue.",
  };
}
