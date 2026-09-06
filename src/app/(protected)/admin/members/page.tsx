import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { isCommunityStaff } from "@/lib/community/queries";
import { createClient } from "@/lib/supabase/server";
import { MemberShell } from "@/components/community/member-shell";
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
      description="Manage participation and founding places. Every decision has an accountable author and a recorded reason."
      active="/admin/members"
    >
      <Link
        href="/admin/reports"
        className="mb-5 inline-block text-sm font-bold text-navy"
      >
        ← Review reports
      </Link>
      <AdmissionForm wave={waves.data} />
      <form action="/admin/members" className="my-5 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          maxLength={24}
          placeholder="Find a username"
          aria-label="Find a username"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-slate-900 px-4 text-sm font-bold text-white">
          Search
        </button>
      </form>
      <p className="mb-3 text-xs text-slate-500">
        Most recent 30 matching members. Search to find a specific writer.
      </p>
      <div className="grid gap-3">
        {((members.data ?? []) as Member[]).map((member) => (
          <article
            key={member.user_id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex justify-between gap-3">
              <Link href={`/u/${member.username}`} className="font-bold">
                @{member.username}
              </Link>
              <span className="text-xs capitalize text-slate-500">
                {member.state}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
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
