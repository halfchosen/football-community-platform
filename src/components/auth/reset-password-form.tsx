import Link from "next/link";
import { requestPasswordReset } from "@/server/actions/auth/request-password-reset";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type ResetPasswordFormProps = {
  error?: string;
  message?: string;
};

export function ResetPasswordForm({ error, message }: ResetPasswordFormProps) {
  return (
    <div className="grid gap-5">
      <form action={requestPasswordReset} className="grid gap-4">
        <FormMessage error={error} message={message} />
        <Input
          autoComplete="email"
          label="Email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <SubmitButton className="w-full" pendingLabel="Sending link…">
          Send reset link
        </SubmitButton>
      </form>
      <p className="text-center text-sm text-slate-600">
        Remembered it after all?{" "}
        <Link className="font-semibold text-violet-700" href="/login">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
