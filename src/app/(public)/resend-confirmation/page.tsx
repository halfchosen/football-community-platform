import { ResendConfirmationForm } from "@/components/auth/resend-confirmation-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth/guards";
import { getSearchParam, type PageSearchParams } from "@/lib/utils/search-params";

type ResendConfirmationPageProps = {
  searchParams: PageSearchParams;
};

export default async function ResendConfirmationPage({
  searchParams,
}: ResendConfirmationPageProps) {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      description="Enter your signup email and we'll send a fresh confirmation link if the account is still awaiting verification."
      title="Resend confirmation"
    >
      <ResendConfirmationForm
        error={await getSearchParam(searchParams, "error")}
        message={await getSearchParam(searchParams, "message")}
      />
    </AuthShell>
  );
}
