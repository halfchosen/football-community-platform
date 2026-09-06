import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  COMMUNITY_POLICY,
  type ActivityItem,
  type Membership,
} from "@/domains/community/policy";

export const getMembership = cache(
  async (userId: string): Promise<Membership | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("community_memberships")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error)
      throw new Error("Membership service is temporarily unavailable.");
    return data as Membership | null;
  },
);

export const hasCurrentAgreements = cache(async (userId: string) => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("legal_acceptances")
    .select("document", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("version", COMMUNITY_POLICY.version);
  if (error) throw new Error("Agreements could not be loaded.");
  return count === 3;
});

export async function getOwnActivity(
  deleted: boolean,
  offset = 0,
): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("community_own_activity", {
    p_deleted: deleted,
    p_offset: offset,
  });
  if (error)
    throw new Error("Your activity could not be loaded. Please try again.");
  return (data ?? []) as ActivityItem[];
}

export type AdmissionStatus = {
  name: string;
  open: boolean;
  capacity: number;
  claimed: number;
  remaining: number;
};
export async function getAdmissionStatus(
  clubId: string | null = null,
): Promise<AdmissionStatus | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("community_admission_status", {
    p_club: clubId,
  });
  return error ? null : (data as AdmissionStatus | null);
}

export type CommunityNotification = {
  id: string;
  topic_id: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
};
export async function getNotifications(
  userId: string,
): Promise<CommunityNotification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_notifications")
    .select("id,topic_id,message,read_at,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error("Notifications could not be loaded.");
  return (data ?? []) as CommunityNotification[];
}

export async function isCommunityStaff() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("community_is_staff");
  return data === true;
}

export type ContentReport = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string;
  status: string;
  decision: string | null;
  appeal: string | null;
  created_at: string;
  evidence?: string;
};
export async function getReports(
  _userId: string,
  staff = false,
): Promise<ContentReport[]> {
  const supabase = await createClient();
  const result = staff
    ? await supabase.rpc("community_moderation_queue")
    : await supabase.rpc("community_my_reports");
  if (result.error) throw new Error("Reports could not be loaded.");
  return (result.data ?? []) as ContentReport[];
}
