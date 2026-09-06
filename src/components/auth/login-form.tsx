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
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-4">
            <span className="h-px flex-1 bg-line" />
            or with email
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : null}
      <ValidatedForm action={login} className="grid gap-4">
        <FormMessage error={error} message={message} />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          required
          type="email"
        />
        <div className="grid gap-1.5">
          <Input
            label="Password"
            aria-label="Password"
            autoComplete="current-password"
            name="password"
            required
            type="password"
          />
          <Link
            className="justify-self-end text-xs font-semibold text-navy hover:underline"
            href="/reset-password"
          >
            Forgot password?
          </Link>
        </div>
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="mt-1 w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </ValidatedForm>
      <div className="border-t border-line pt-4 text-center">
        <p className="text-[13.5px] text-ink-2">
          New here?{" "}
          <Link className="font-semibold text-navy hover:underline" href="/signup">
            Create an account
          </Link>
        </p>
        <p className="mt-1.5 text-xs text-ink-4">
          Still waiting on your signup email?{" "}
          <Link className="font-semibold text-ink-3 hover:text-navy hover:underline" href="/resend-confirmation">
            Send it again
          </Link>
        </p>
      </div>
    </div>
  );
}
