"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/field";
import { CheckIcon } from "@/components/ui/icons";
import {
  getPasswordRequirementStatus,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/validation";

type PasswordFieldsProps = {
  passwordLabel?: string;
  passwordPlaceholder?: string;
  confirmationLabel?: string;
  confirmationPlaceholder?: string;
};

const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];

/**
 * The rule list used to sit under the field as a full sentence plus five
 * always-visible chips — a wall of text on the most-read screen in the
 * product. It is now a four-segment meter with only the rules still missing
 * spelled out, so a valid password says almost nothing at all.
 */
export function PasswordFields({
  passwordLabel = "Password",
  passwordPlaceholder,
  confirmationLabel = "Confirm password",
  confirmationPlaceholder,
}: PasswordFieldsProps) {
  const statusId = useId();
  const confirmationStatusId = useId();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const requirements = getPasswordRequirementStatus(password);
  const met = requirements.filter((requirement) => requirement.met).length;
  const missing = requirements.filter((requirement) => !requirement.met);
  const started = password.length > 0;
  const score = Math.max(0, Math.min(4, met - 1));
  const confirmationStarted = confirmation.length > 0;
  const passwordsMatch = confirmationStarted && password === confirmation;

  return (
    <>
      <Input
        aria-describedby={statusId}
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

      <div aria-live="polite" className="-mt-1 grid gap-1.5" id={statusId}>
        <div className="flex items-center gap-2">
          <div className="flex h-1 flex-1 gap-1" aria-hidden>
            {[0, 1, 2, 3].map((index) => (
              <span
                className={`h-full flex-1 rounded-full transition-colors ${
                  started && index <= score
                    ? score >= 3
                      ? "bg-accent"
                      : score >= 2
                        ? "bg-warn"
                        : "bg-danger"
                    : "bg-line"
                }`}
                key={index}
              />
            ))}
          </div>
          <span
            className={`w-16 shrink-0 text-right text-[11px] font-semibold ${
              started ? "text-ink-3" : "text-transparent"
            }`}
          >
            {started ? STRENGTH[score] : "—"}
          </span>
        </div>

        {missing.length > 0 ? (
          <p className="text-xs leading-5 text-ink-3">
            {started ? "Still needs" : "Needs"}:{" "}
            {missing.map((requirement) => requirement.label.toLowerCase()).join(", ")}.
          </p>
        ) : (
          <p className="flex items-center gap-1 text-xs font-semibold leading-5 text-accent-strong">
            <CheckIcon size={12} />
            Strong enough.
          </p>
        )}
        <span className="sr-only">
          {met} of {requirements.length} password requirements met.
        </span>
      </div>

      <Input
        aria-describedby={confirmationStarted ? confirmationStatusId : undefined}
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
      {confirmationStarted && !passwordsMatch ? (
        <p
          aria-live="polite"
          className="-mt-1 text-xs font-medium text-danger"
          id={confirmationStatusId}
        >
          Passwords do not match yet.
        </p>
      ) : null}
    </>
  );
}
