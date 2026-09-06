import { AppShell } from "@/components/layout/app-shell";
import { AccountStatus } from "@/components/community/account-status";
import { requireUser } from "@/lib/auth/guards";
import { getMembership } from "@/lib/community/queries";
import { redirect } from "next/navigation";
export default async function RecoveryPage() {
  const user = await requireUser();
  const m = await getMembership(user.id);
  if (!m) redirect("/onboarding");
  if (m.state === "active") redirect("/");
  const recoverable =
    m.state === "frozen" &&
    m.deletion_due_at &&
    Date.parse(m.deletion_due_at) > new Date().getTime();
  return (
    <AppShell>
      <AccountStatus
        state={m.state}
        recoverable={Boolean(recoverable)}
        deletionDate={m.deletion_due_at}
      />
    </AppShell>
  );
}
