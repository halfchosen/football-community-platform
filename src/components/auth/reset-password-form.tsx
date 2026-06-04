import { requestPasswordReset } from "@/server/actions/auth/request-password-reset";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";

type ResetPasswordFormProps = {
  error?: string;
  message?: string;
};

export function ResetPasswordForm({ error, message }: ResetPasswordFormProps) {
  return (
    <form action={requestPasswordReset} className="grid gap-4">
      <FormMessage error={error} message={message} />
      <Input autoComplete="email" label="Email" name="email" required type="email" />
      <Button type="submit">Send reset link</Button>
    </form>
  );
}
