import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type LoginPageProps = {
  searchParams: PageSearchParams;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      description="Good to see you again. Sign in and pick up where you left off."
      title="Log in"
    >
      <LoginForm
        error={await getSearchParam(searchParams, "error")}
        message={await getSearchParam(searchParams, "message")}
      />
    </AuthShell>
  );
}
