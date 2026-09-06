import { ValidatedForm } from "@/components/ui/validated-form";
import Link from "next/link";
import { CaptchaField } from "@/components/auth/captcha-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getTurnstileSiteKey } from "@/lib/auth/config";
import { resendConfirmation } from "@/server/actions/auth/resend-confirmation";

type ResendConfirmationFormProps = {
  error?: string;
  message?: string;
};

export function ResendConfirmationForm({
  error,
  message,
}: ResendConfirmationFormProps) {
  return (
    <div className="grid gap-5">
      <ValidatedForm action={resendConfirmation} className="grid gap-4">
        <FormMessage error={error} message={message} />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="w-full" pendingLabel="Sending…">
          Resend confirmation
        </SubmitButton>
      </ValidatedForm>
      <p className="text-center text-sm text-slate-600">
        Already confirmed?{" "}
        <Link className="font-semibold text-navy hover:text-navy-strong" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
