import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type ResetPasswordPageProps = {
  searchParams: PageSearchParams;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <AuthShell
      description="Enter your email and we will send a password reset link."
      title="Reset password"
    >
      <ResetPasswordForm
        error={await getSearchParam(searchParams, "error")}
        message={await getSearchParam(searchParams, "message")}
      />
    </AuthShell>
  );
}
