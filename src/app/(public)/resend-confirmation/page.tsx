import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";
import { AuthResult, AuthResultLink } from "@/components/auth/auth-result";
import { AuthShell } from "@/components/layout/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import {
  getSearchParam,
  type PageSearchParams,
} from "@/lib/utils/search-params";

type ResendConfirmationPageProps = {
  searchParams: PageSearchParams;
};

export default async function ResendConfirmationPage({
  searchParams,
}: ResendConfirmationPageProps) {
  await redirectAuthenticatedUser();

  const [error, message] = await Promise.all([
    getSearchParam(searchParams, "error"),
    getSearchParam(searchParams, "message"),
  ]);

  if (message) {
    return (
      <AuthShell title="Check your inbox" description="">
        <AuthResult
          title="Check your email"
          primary={{ href: "/", label: "Browse while you wait" }}
          footnote={
            <>
              Already confirmed?{" "}
              <AuthResultLink href="/login">Log in</AuthResultLink>.
            </>
          }
        >
          {message}
        </AuthResult>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      description="We'll send a fresh confirmation link."
      title="Resend confirmation"
    >
      <ResendConfirmationForm error={error} />
    </AuthShell>
  );
}
