import { ValidatedForm } from "@/components/ui/validated-form";
import { updatePassword } from "@/server/actions/auth/update-password";
import { FormMessage } from "@/components/ui/form-message";
import { PasswordFields } from "@/components/auth/password-fields";
import { SubmitButton } from "@/components/ui/submit-button";

type UpdatePasswordFormProps = {
  error?: string;
};

export function UpdatePasswordForm({ error }: UpdatePasswordFormProps) {
  return (
    <ValidatedForm action={updatePassword} className="grid gap-4">
      <FormMessage error={error} />
      <PasswordFields
        confirmationLabel="Confirm new password"
        confirmationPlaceholder="Repeat your new password"
        passwordLabel="New password"
        passwordPlaceholder="Create a new password"
      />
      <SubmitButton className="mt-1 w-full" pendingLabel="Saving password…">
        Save new password
      </SubmitButton>
    </ValidatedForm>
  );
}
