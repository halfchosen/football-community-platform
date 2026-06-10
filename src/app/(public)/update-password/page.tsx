import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type UpdatePasswordPageProps = {
  searchParams: PageSearchParams;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  return (
    <AuthShell
      description="Almost there — choose a new password for your account."
      title="Set a new password"
    >
      <UpdatePasswordForm error={await getSearchParam(searchParams, "error")} />
    </AuthShell>
  );
}
