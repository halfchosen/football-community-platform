import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { isCommunityStaff } from "@/lib/community/queries";
import { createClient } from "@/lib/supabase/server";
import { MemberShell } from "@/components/community/member-shell";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/ui/field";
import { ArrowLeftIcon } from "@/components/ui/icons";
import {
  AdmissionForm,
  MemberDecisionForm,
} from "@/components/community/admin-forms";
export const metadata = { title: "Members & admission" };
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  if (!(await isCommunityStaff())) notFound();
  const { q = "" } = await searchParams;
  const supabase = await createClient();
  const [members, waves] = await Promise.all([
    supabase.rpc("community_member_directory", { p_search: q }),
    supabase
      .from("admission_waves")
      .select("name,capacity,club_capacity,is_open,admitted")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);
  if (members.error || waves.error)
    throw new Error("Community operations could not be loaded.");
  type Member = {
    user_id: string;
    username: string;
    state: string;
    writer_status: string;
    generation: string;
    seat_number: number | null;
  };
  return (
    <MemberShell
      title="Members & admission"
      description="Participation and founding places. Every decision carries a name and a reason."
      active="/admin/members"
    >
      <Link
        href="/admin/reports"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy hover:underline"
      >
        <ArrowLeftIcon size={14} />
        Review reports
      </Link>
      <AdmissionForm wave={waves.data} />
      <form action="/admin/members" className="my-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          maxLength={24}
          placeholder="Find a username"
          aria-label="Find a username"
          className={`${inputClassName} min-w-0 flex-1`}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      <p className="mb-3 text-[12px] text-ink-4">
        Showing the 30 most recent matches.
      </p>
      <div className="grid gap-3">
        {((members.data ?? []) as Member[]).map((member) => (
          <article
            key={member.user_id}
            className="rounded-lg border border-line bg-surface p-5"
          >
            <div className="flex justify-between gap-3">
              <Link
                href={`/u/${member.username}`}
                className="text-[14px] font-bold text-ink hover:text-navy"
              >
                @{member.username}
              </Link>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-4">
                {member.state}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-ink-3">
              {member.writer_status} · {member.generation}
              {member.seat_number
                ? ` #${member.seat_number}`
                : " · Waiting for a place"}
            </p>
            <MemberDecisionForm userId={member.user_id} state={member.state} />
          </article>
        ))}
      </div>
    </MemberShell>
  );
}
