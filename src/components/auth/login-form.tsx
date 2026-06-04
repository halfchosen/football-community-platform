import Link from "next/link";
import { login } from "@/server/actions/auth/login";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SocialLoginButton } from "@/components/auth/social-login-button";

type LoginFormProps = {
  error?: string;
  message?: string;
};

export function LoginForm({ error, message }: LoginFormProps) {
  return (
    <div className="grid gap-5">
      <SocialLoginButton />
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        Email
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <form action={login} className="grid gap-4">
        <FormMessage error={error} message={message} />
        <Input autoComplete="email" label="Email" name="email" required type="email" />
        <Input
          autoComplete="current-password"
          label="Password"
          name="password"
          required
          type="password"
        />
        <Button type="submit">Log in</Button>
      </form>
      <div className="flex justify-between text-sm text-stone-600">
        <Link className="font-medium text-emerald-800" href="/reset-password">
          Forgot password?
        </Link>
        <Link className="font-medium text-emerald-800" href="/signup">
          Create account
        </Link>
      </div>
    </div>
  );
}
