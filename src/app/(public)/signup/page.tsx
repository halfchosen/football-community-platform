import { SignupForm } from "@/components/auth/signup-form";
import { AuthResult, AuthResultLink } from "@/components/auth/auth-result";
import { AuthShell } from "@/components/layout/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { SIGNUP_NEUTRAL_MESSAGE } from "@/lib/auth/messages";
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

  // Accepted and duplicate signups share this screen. Neither the provider
  // response nor an old message URL should imply an account or email was created.
  if (message) {
    return (
      <AuthShell title="Your next step" description="">
        <AuthResult
          title="Your next step"
          primary={{ href: "/login", label: "Log in" }}
          secondary={{ href: "/reset-password", label: "Reset password" }}
          footnote={
            <>
              Signing up again does not reset your password or guarantee another
              email. Waiting for confirmation? Check spam or{" "}
              <AuthResultLink href="/resend-confirmation">
                request a confirmation link
              </AuthResultLink>
              . You can also{" "}
              <AuthResultLink href="/">browse the community</AuthResultLink>.
            </>
          }
        >
          {SIGNUP_NEUTRAL_MESSAGE}
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
