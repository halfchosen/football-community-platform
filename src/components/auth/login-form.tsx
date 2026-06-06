import Link from "next/link";
import { login } from "@/server/actions/auth/login";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SocialLoginButton } from "@/components/auth/social-login-button";

type LoginFormProps = {
  error?: string;
  message?: string;
};

export function LoginForm({ error, message }: LoginFormProps) {
  return (
    <div className="grid gap-5">
      <SocialLoginButton />
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        or with email
        <span className="h-px flex-1 bg-stone-200" />
      </div>
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
            <span className="text-sm font-medium text-stone-800">Password</span>
            <Link
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              href="/reset-password"
            >
              Forgot password?
            </Link>
          </div>
          <input
            aria-label="Password"
            autoComplete="current-password"
            className="h-12 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 hover:border-stone-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            name="password"
            placeholder="••••••••"
            required
            type="password"
          />
        </div>
        <SubmitButton className="mt-1 w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-stone-600">
        New to the community?{" "}
        <Link className="font-semibold text-emerald-700" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  );
}
