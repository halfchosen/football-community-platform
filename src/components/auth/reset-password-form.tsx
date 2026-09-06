import { ValidatedForm } from "@/components/ui/validated-form";
import Link from "next/link";
import { requestPasswordReset } from "@/server/actions/auth/request-password-reset";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { CaptchaField } from "@/components/auth/captcha-field";
import { getTurnstileSiteKey } from "@/lib/auth/config";

type ResetPasswordFormProps = {
  error?: string;
  message?: string;
};

export function ResetPasswordForm({ error, message }: ResetPasswordFormProps) {
  return (
    <div className="grid gap-5">
      <ValidatedForm action={requestPasswordReset} className="grid gap-4">
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
        <SubmitButton className="w-full" pendingLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </ValidatedForm>
      <p className="border-t border-line pt-4 text-center text-[13.5px] text-ink-2">
        Remembered it after all?{" "}
        <Link className="font-semibold text-navy hover:underline" href="/login">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
