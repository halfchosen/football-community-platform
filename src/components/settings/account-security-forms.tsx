import { FormMessage } from "@/components/ui/form-message";
import { CaptchaField } from "@/components/auth/captcha-field";
import { PasswordFields } from "@/components/auth/password-fields";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getTurnstileSiteKey } from "@/lib/auth/config";
import { changePassword } from "@/server/actions/auth/change-password";
import { deleteAccount } from "@/server/actions/auth/delete-account";

type ChangePasswordFormProps = {
  error?: string;
};

export function ChangePasswordForm({ error }: ChangePasswordFormProps) {
  return (
    <form action={changePassword} className="grid gap-4">
      <FormMessage error={error} />
      <Input
        autoComplete="current-password"
        label="Current password"
        name="currentPassword"
        required
        type="password"
      />
      <PasswordFields
        confirmationLabel="Confirm new password"
        passwordLabel="New password"
      />
      <CaptchaField siteKey={getTurnstileSiteKey()} />
      <SubmitButton className="justify-self-start" pendingLabel="Changing…">
        Change password
      </SubmitButton>
    </form>
  );
}

type DeleteAccountFormProps = {
  email: string;
  error?: string;
  requiresPassword: boolean;
};

export function DeleteAccountForm({
  email,
  error,
  requiresPassword,
}: DeleteAccountFormProps) {
  return (
    <form action={deleteAccount} className="grid gap-4">
      <FormMessage error={error} />
      <Input
        autoComplete="off"
        hint={`Type ${email} exactly.`}
        label="Confirm account email"
        name="confirmationEmail"
        required
        spellCheck={false}
        type="email"
      />
      {requiresPassword ? (
        <Input
          autoComplete="current-password"
          label="Current password"
          name="currentPassword"
          required
          type="password"
        />
      ) : null}
      <CaptchaField siteKey={getTurnstileSiteKey()} />
      <SubmitButton
        className="justify-self-start !bg-red-700 !shadow-red-700/20 hover:!bg-red-600"
        pendingLabel="Deleting account…"
      >
        Permanently delete account
      </SubmitButton>
    </form>
  );
}
