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
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
            <span className="h-px flex-1 bg-line" />
            or with email
            <span className="h-px flex-1 bg-line" />
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
        <label className="flex items-start gap-2.5 rounded-md border border-line bg-sunken p-3 text-xs leading-5 text-ink-2 transition-colors has-[:checked]:border-accent-line has-[:checked]:bg-accent-wash">
          <input
            name="signupTerms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
          />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" target="_blank" className="font-semibold text-navy underline">
              Terms of Use
            </Link>{" "}
            and have read the{" "}
            <Link href="/legal/privacy" target="_blank" className="font-semibold text-navy underline">
              Privacy Notice
            </Link>
            .
          </span>
        </label>
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="mt-1 w-full" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </ValidatedForm>
      <p className="text-center text-xs leading-5 text-ink-4">
        Confirm your email, then claim your club&apos;s founding number. Places
        are limited.
      </p>
      <div className="border-t border-line pt-4 text-center">
        <p className="text-[13.5px] text-ink-2">
          Already a member?{" "}
          <Link className="font-semibold text-navy hover:underline" href="/login">
            Log in
          </Link>
        </p>
        <p className="mt-1.5 text-xs text-ink-4">
          No confirmation email?{" "}
          <Link className="font-semibold text-ink-3 hover:text-navy hover:underline" href="/resend-confirmation">
            Send it again
          </Link>
        </p>
      </div>
    </div>
  );
}
