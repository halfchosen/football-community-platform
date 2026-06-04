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
      description="Set a new password after opening your reset link."
      title="Update password"
    >
      <UpdatePasswordForm error={await getSearchParam(searchParams, "error")} />
    </AuthShell>
  );
}
