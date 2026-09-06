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
      description="Pick your club, claim your number, have your say."
      title="Join the crowd"
    >
      <SignupForm
        error={await getSearchParam(searchParams, "error")}
        message={await getSearchParam(searchParams, "message")}
      />
    </AuthShell>
  );
}
