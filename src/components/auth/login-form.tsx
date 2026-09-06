import { ValidatedForm } from "@/components/ui/validated-form";
import Link from "next/link";
import { login } from "@/server/actions/auth/login";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { CaptchaField } from "@/components/auth/captcha-field";
import {
  getTurnstileSiteKey,
  isGoogleAuthEnabled,
} from "@/lib/auth/config";

type LoginFormProps = {
  error?: string;
  message?: string;
};

export function LoginForm({ error, message }: LoginFormProps) {
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
      <ValidatedForm action={login} className="grid gap-4">
        <FormMessage error={error} message={message} />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Secure sign-in</span>
            <Link
              className="text-xs font-semibold text-navy hover:text-navy-strong"
              href="/reset-password"
            >
              Forgot password?
            </Link>
          </div>
          <Input label="Password" aria-label="Password" autoComplete="current-password" name="password" required type="password" />
        </div>
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="mt-1 w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </ValidatedForm>
      <p className="text-center text-sm text-slate-600">
        New to the community?{" "}
        <Link className="font-semibold text-navy hover:text-navy-strong" href="/signup">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        Still waiting for your signup email?{" "}
        <Link className="font-semibold text-navy hover:text-navy-strong" href="/resend-confirmation">
          Resend confirmation
        </Link>
      </p>
    </div>
  );
}
