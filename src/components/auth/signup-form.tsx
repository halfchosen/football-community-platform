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
};

export function SignupForm({ error }: SignupFormProps) {
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
        <FormMessage error={error} />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          required
          type="email"
        />
        <PasswordFields />
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
      <p className="border-t border-line pt-4 text-center text-[13.5px] text-ink-2">
        Already a member?{" "}
        <Link className="font-semibold text-navy hover:underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
