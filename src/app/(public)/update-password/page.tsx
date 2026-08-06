import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/server";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type UpdatePasswordPageProps = {
  searchParams: PageSearchParams;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/reset-password?error=Your password reset session is missing or expired. Request a new link and try again.",
    );
  }

  return (
    <AuthShell
      description="Almost there — choose a new password for your account."
      title="Set a new password"
    >
      <UpdatePasswordForm error={await getSearchParam(searchParams, "error")} />
    </AuthShell>
  );
}
