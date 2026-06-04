import Link from "next/link";
import { signup } from "@/server/actions/auth/signup";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SocialLoginButton } from "@/components/auth/social-login-button";

type SignupFormProps = {
  error?: string;
};

export function SignupForm({ error }: SignupFormProps) {
  return (
    <div className="grid gap-5">
      <SocialLoginButton />
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        Email
        <span className="h-px flex-1 bg-stone-200" />
      </div>
      <form action={signup} className="grid gap-4">
        <FormMessage error={error} />
        <Input autoComplete="email" label="Email" name="email" required type="email" />
        <Input
          autoComplete="new-password"
          hint="Use at least 8 characters."
          label="Password"
          minLength={8}
          name="password"
          required
          type="password"
        />
        <Button type="submit">Create account</Button>
      </form>
      <p className="text-sm text-stone-600">
        Already joined?{" "}
        <Link className="font-medium text-emerald-800" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
