import { ValidatedForm } from "@/components/ui/validated-form";
import { FormMessage } from "@/components/ui/form-message";
import { CaptchaField } from "@/components/auth/captcha-field";
import { PasswordFields } from "@/components/auth/password-fields";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { getTurnstileSiteKey } from "@/lib/auth/config";
import { changePassword } from "@/server/actions/auth/change-password";
import {changeEmail} from "@/server/actions/auth/change-email";
import { deleteAccount } from "@/server/actions/auth/delete-account";

type ChangePasswordFormProps = {
  error?: string;
};

export function ChangePasswordForm({ error }: ChangePasswordFormProps) {
  return (
    <ValidatedForm action={changePassword} className="grid gap-4">
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
    </ValidatedForm>
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
    <ValidatedForm action={deleteAccount} className="grid gap-4">
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
      <label className="flex items-start gap-2.5 rounded-md border border-line bg-sunken p-3 text-[13px] leading-6 text-ink-2">
        <input
          name="immediateErasure"
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-navy"
        />
        Skip the 30-day recovery window and erase everything now.
      </label>
      <CaptchaField siteKey={getTurnstileSiteKey()} />
      <SubmitButton
        className="justify-self-start"
        variant="danger"
        pendingLabel="Closing account…"
      >
        Close my account
      </SubmitButton>
    </ValidatedForm>
  );
}

export function ChangeEmailForm({requiresPassword,error,message}:{requiresPassword:boolean;error?:string;message?:string}) {
 return <ValidatedForm action={changeEmail} className="mt-4 grid gap-4"><FormMessage error={error} message={message}/><Input name="newEmail" label="New email address" type="email" autoComplete="email" required/>{requiresPassword&&<Input name="currentPassword" label="Current password" type="password" autoComplete="current-password" required/>}<CaptchaField siteKey={getTurnstileSiteKey()}/><SubmitButton className="justify-self-start" pendingLabel="Requesting…">Request email change</SubmitButton></ValidatedForm>;
}
