import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthResult, AuthResultLink } from "@/components/auth/auth-result";
import { AuthShell } from "@/components/layout/auth-shell";
import { KeyIcon } from "@/components/ui/icons";
import {
  getSearchParam,
  type PageSearchParams,
} from "@/lib/utils/search-params";

type ResetPasswordPageProps = {
  searchParams: PageSearchParams;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const [error, message] = await Promise.all([
    getSearchParam(searchParams, "error"),
    getSearchParam(searchParams, "message"),
  ]);

  if (message) {
    return (
      <AuthShell title="Check your inbox" description="">
        <AuthResult
          title="Check your inbox"
          icon={<KeyIcon size={20} />}
          primary={{ href: "/login", label: "Back to log in" }}
          footnote={
            <>
              The link works once and expires shortly. Nothing arrived?{" "}
              <AuthResultLink href="/reset-password">Try again</AuthResultLink>.
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
      description="We'll email you a link to set a new one."
      title="Reset your password"
    >
      <ResetPasswordForm error={error} />
    </AuthShell>
  );
}
