import { SignupForm } from "@/components/auth/signup-form";
import { AuthResult, AuthResultLink } from "@/components/auth/auth-result";
import { AuthShell } from "@/components/layout/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import {
  getSearchParam,
  type PageSearchParams,
} from "@/lib/utils/search-params";

type SignupPageProps = {
  searchParams: PageSearchParams;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  await redirectAuthenticatedUser();

  const [error, message] = await Promise.all([
    getSearchParam(searchParams, "error"),
    getSearchParam(searchParams, "message"),
  ]);

  // The signup step is finished: show where the user goes next, not the form
  // they already submitted. The message text itself is deliberately neutral
  // about whether the address is registered — that wording is unchanged.
  if (message) {
    return (
      <AuthShell title="Check your inbox" description="">
        <AuthResult
          title="Check your inbox"
          primary={{ href: "/", label: "Browse while you wait" }}
          footnote={
            <>
              Nothing after a few minutes? Look in spam, or{" "}
              <AuthResultLink href="/resend-confirmation">
                send the link again
              </AuthResultLink>
              . Already confirmed?{" "}
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
      description="Pick your club, claim your number, have your say."
      title="Join the crowd"
    >
      <SignupForm error={error} />
    </AuthShell>
  );
}
