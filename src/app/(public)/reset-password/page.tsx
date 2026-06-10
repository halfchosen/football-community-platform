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
      description="Enter the email you signed up with and we'll send you a link to reset your password."
      title="Reset your password"
    >
      <ResetPasswordForm
        error={await getSearchParam(searchParams, "error")}
        message={await getSearchParam(searchParams, "message")}
      />
    </AuthShell>
  );
}
