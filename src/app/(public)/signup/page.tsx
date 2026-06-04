import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type SignupPageProps = {
  searchParams: PageSearchParams;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      description="Start with account access, then complete onboarding with your football identity."
      title="Create account"
    >
      <SignupForm error={await getSearchParam(searchParams, "error")} />
    </AuthShell>
  );
}
