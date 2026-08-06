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
      <form action={login} className="grid gap-4">
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
            <span className="text-sm font-medium text-slate-800">Password</span>
            <Link
              className="text-xs font-semibold text-violet-700 hover:text-violet-700"
              href="/reset-password"
            >
              Forgot password?
            </Link>
          </div>
          <input
            aria-label="Password"
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </div>
        <CaptchaField siteKey={getTurnstileSiteKey()} />
        <SubmitButton className="mt-1 w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-slate-600">
        New to the community?{" "}
        <Link className="font-semibold text-violet-700" href="/signup">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        Still waiting for your signup email?{" "}
        <Link className="font-semibold text-violet-700" href="/resend-confirmation">
          Resend confirmation
        </Link>
      </p>
    </div>
  );
}
