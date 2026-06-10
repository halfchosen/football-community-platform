import { updatePassword } from "@/server/actions/auth/update-password";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type UpdatePasswordFormProps = {
  error?: string;
};

export function UpdatePasswordForm({ error }: UpdatePasswordFormProps) {
  return (
    <form action={updatePassword} className="grid gap-4">
      <FormMessage error={error} />
      <Input
        autoComplete="new-password"
        hint="Use at least 8 characters."
        label="New password"
        minLength={8}
        name="password"
        placeholder="Create a new password"
        required
        type="password"
      />
      <Input
        autoComplete="new-password"
        label="Confirm new password"
        minLength={8}
        name="confirmPassword"
        placeholder="Repeat your new password"
        required
        type="password"
      />
      <SubmitButton className="mt-1 w-full" pendingLabel="Saving password…">
        Save new password
      </SubmitButton>
    </form>
  );
}
