"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/field";
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
        className="-mt-2 grid gap-2 text-xs text-slate-500"
        id={requirementsId}
      >
        <p>{PASSWORD_REQUIREMENTS}</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-1" role="list">
          {requirements.map(({ key, label, met }) => (
            <li
              className={met ? "font-medium text-emerald-700" : undefined}
              key={key}
            >
              <span aria-hidden className="mr-1">
                {met ? "✓" : "○"}
              </span>
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
          className={`-mt-2 text-xs font-medium ${
            passwordsMatch ? "text-emerald-700" : "text-amber-700"
          }`}
          id={confirmationStatusId}
        >
          {passwordsMatch ? "Passwords match." : "Passwords do not match yet."}
        </p>
      ) : null}
    </>
  );
}
