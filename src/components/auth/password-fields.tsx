"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/field";
import { CheckIcon } from "@/components/ui/icons";
import {
  getPasswordRequirementStatus,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIREMENTS,
} from "@/lib/auth/validation";

type PasswordFieldsProps = {
  passwordLabel?: string;
  passwordPlaceholder?: string;
  confirmationLabel?: string;
  confirmationPlaceholder?: string;
};

export function PasswordFields({
  passwordLabel = "Password",
  passwordPlaceholder,
  confirmationLabel = "Confirm password",
  confirmationPlaceholder,
}: PasswordFieldsProps) {
  const requirementsId = useId();
  const confirmationStatusId = useId();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const requirements = getPasswordRequirementStatus(password);
  const completedCount = requirements.filter(({ met }) => met).length;
  const confirmationStarted = confirmation.length > 0;
  const passwordsMatch = confirmationStarted && password === confirmation;

  return (
    <>
      <Input
        aria-describedby={requirementsId}
        autoComplete="new-password"
        label={passwordLabel}
        maxLength={PASSWORD_MAX_LENGTH}
        minLength={PASSWORD_MIN_LENGTH}
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder={passwordPlaceholder}
        required
        type="password"
        value={password}
      />
      <div
        aria-live="polite"
        className="-mt-1 grid gap-1.5 text-xs text-ink-3"
        id={requirementsId}
      >
        <p>{PASSWORD_REQUIREMENTS}</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-1" role="list">
          {requirements.map(({ key, label, met }) => (
            <li
              className={`inline-flex items-center gap-1 ${met ? "font-semibold text-accent-strong" : ""}`}
              key={key}
            >
              {met ? (
                <CheckIcon size={12} />
              ) : (
                <span aria-hidden className="h-1 w-1 rounded-full bg-ink-4" />
              )}
              {label}
            </li>
          ))}
        </ul>
        <span className="sr-only">
          {completedCount} of {requirements.length} password requirements met.
        </span>
      </div>
      <Input
        aria-describedby={
          confirmationStarted ? confirmationStatusId : undefined
        }
        autoComplete="new-password"
        label={confirmationLabel}
        maxLength={PASSWORD_MAX_LENGTH}
        minLength={PASSWORD_MIN_LENGTH}
        name="confirmPassword"
        onChange={(event) => setConfirmation(event.target.value)}
        placeholder={confirmationPlaceholder}
        required
        type="password"
        value={confirmation}
      />
      {confirmationStarted ? (
        <p
          aria-live="polite"
          className={`-mt-1 text-xs font-medium ${
            passwordsMatch ? "text-accent-strong" : "text-danger"
          }`}
          id={confirmationStatusId}
        >
          {passwordsMatch ? "Passwords match." : "Passwords do not match yet."}
        </p>
      ) : null}
    </>
  );
}
