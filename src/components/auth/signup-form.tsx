import { ValidatedForm } from "@/components/ui/validated-form";
import Link from "next/link";
import { signup } from "@/server/actions/auth/signup";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { CaptchaField } from "@/components/auth/captcha-field";
import { PasswordFields } from "@/components/auth/password-fields";
import {
  getTurnstileSiteKey,
  isGoogleAuthEnabled,
} from "@/lib/auth/config";

type SignupFormProps = {
  error?: string;
  message?: string;
};

export function SignupForm({ error, message }: SignupFormProps) {
  const googleEnabled = isGoogleAuthEnabled();

  return (
    <div className="grid gap-5">
      {googleEnabled ? (
        <>
          <SocialLoginButton />
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      ) : null}
      <ValidatedForm action={signup} className="grid gap-4">
        <FormMessage error={error} message={message} />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <PasswordFields
          confirmationPlaceholder="Repeat your password"
          passwordPlaceholder="Create a password"
        />
        <label className="flex items-start gap-2 text-xs leading-5 text-slate-600"><input name="signupTerms" type="checkbox" required className="mt-1 accent-navy"/><span>I agree to the <Link href="/legal/terms" target="_blank" className="underline">Terms of Use</Link> and have read the <Link href="/legal/privacy" target="_blank" className="underline">Privacy Notice</Link>.</span></label>
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="mt-1 w-full" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </ValidatedForm>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-navy hover:text-navy-strong" href="/login">
          Log in
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-400">
        Verify your email, then claim a place for your club. Places are limited.
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        Didn&apos;t receive the confirmation email?{" "}
        <Link className="font-semibold text-navy hover:text-navy-strong" href="/resend-confirmation">
          Send it again
        </Link>
      </p>
    </div>
  );
}
