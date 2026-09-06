import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/guards";
import { acceptAgreements } from "@/server/actions/community/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { isCommunityLaunchReady } from "@/lib/community/legal";
export default async function AgreementsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser();
  const { error } = await searchParams;
  const open =
    isCommunityLaunchReady() || process.env.NODE_ENV !== "production";
  return (
    <AppShell>
      <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-navy">
          Before your next take
        </p>
        <h1 className="mt-3 text-3xl font-bold">Know where you stand</h1>
        <p className="my-4 text-sm leading-7 text-slate-500">
          We have updated how membership, content deletion, and community
          reviews work. Read each document before continuing.
        </p>
        {!open && (
          <p className="mb-4 text-sm text-navy">
            Our launch policies are being finalised. You can keep browsing while
            registration and participation are closed.
          </p>
        )}
        <form action={acceptAgreements} className="grid gap-4">
          {error && (
            <p role="alert" className="text-sm text-rose-700">
              {error}
            </p>
          )}
          {[
            ["terms", "I agree to the", "Terms of Use"],
            ["rules", "I accept the", "Community Rules"],
            ["privacy", "I have read the", "Privacy Notice"],
          ].map(([key, prefix, label]) => (
            <label
              key={key}
              className="flex items-start gap-3 rounded-lg border border-slate-200 p-4 text-sm leading-6"
            >
              <input
                type="checkbox"
                name={key}
                required
                className="mt-1 accent-navy"
              />
              <span>
                {prefix}{" "}
                <Link
                  href={`/legal/${key}`}
                  target="_blank"
                  className="font-semibold text-navy underline"
                >
                  {label}
                </Link>
                .
              </span>
            </label>
          ))}
          <SubmitButton disabled={!open}>
            Continue to the community
          </SubmitButton>
        </form>
      </section>
    </AppShell>
  );
}
