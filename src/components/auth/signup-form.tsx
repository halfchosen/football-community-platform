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
      <form action={signup} className="grid gap-4">
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
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="mt-1 w-full" pendingLabel="Creating account…">
          Create account
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-violet-700" href="/login">
          Log in
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-400">
        By creating an account you agree to take part in respectful football
        discussion.
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        Didn&apos;t receive the confirmation email?{" "}
        <Link className="font-semibold text-violet-700" href="/resend-confirmation">
          Send it again
        </Link>
      </p>
    </div>
  );
}
