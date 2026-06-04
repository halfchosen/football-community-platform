import { updatePassword } from "@/server/actions/auth/update-password";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/field";

type UpdatePasswordFormProps = {
  error?: string;
};

export function UpdatePasswordForm({ error }: UpdatePasswordFormProps) {
  return (
    <form action={updatePassword} className="grid gap-4">
      <FormMessage error={error} />
      <Input
        autoComplete="new-password"
        label="New password"
        minLength={8}
        name="password"
        required
        type="password"
      />
      <Input
        autoComplete="new-password"
        label="Confirm password"
        minLength={8}
        name="confirmPassword"
        required
        type="password"
      />
      <Button type="submit">Update password</Button>
    </form>
  );
}
