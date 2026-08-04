"use client";

import { useEffect, useState } from "react";
import {
  USERNAME_FORMAT_MESSAGE,
  USERNAME_PATTERN,
} from "@/domains/profile/schemas";
import { checkUsernameAvailability } from "@/server/actions/profile/check-username";
import { inputClassName } from "@/components/ui/field";

type UsernameFieldProps = {
  /** Server-returned error (e.g. taken at submit time); overrides live status. */
  serverError?: string;
  defaultValue?: string;
};

type AvailabilityResult = {
  username: string;
  result: "available" | "taken" | "unknown";
};

const CHECK_DEBOUNCE_MS = 450;

// Username input with instant validation: format errors as you type and a
// debounced availability check against the database. Availability fails open
// ("unknown" shows nothing) — the unique constraint still guards submission.
export function UsernameField({ serverError, defaultValue = "" }: UsernameFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);

  // A submit-time server error stays visible until the user edits the field,
  // then live validation takes over again.
  const [prevServerError, setPrevServerError] = useState(serverError);
  const [serverErrorDismissed, setServerErrorDismissed] = useState(false);

  if (prevServerError !== serverError) {
    setPrevServerError(serverError);
    setServerErrorDismissed(false);
  }

  const activeServerError = serverErrorDismissed ? undefined : serverError;

  useEffect(() => {
    const username = value.trim().toLowerCase();

    if (!USERNAME_PATTERN.test(username)) {
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(username)
        .then((result) => {
          setAvailability({
            username,
            result: result === "available" || result === "taken" ? result : "unknown",
          });
        })
        .catch(() => {
          setAvailability({ username, result: "unknown" });
        });
    }, CHECK_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value]);

  // Live status derived from current input; async results only count while
  // they still match what is typed.
  const username = value.trim().toLowerCase();
  const formatOk = USERNAME_PATTERN.test(username);
  const currentResult =
    availability && availability.username === username ? availability.result : null;
  const checking = formatOk && currentResult === null;
  const showFormatError = !formatOk && username.length > 0 && touched;
  const taken = currentResult === "taken";
  const available = currentResult === "available";

  const liveMessage = activeServerError
    ? { tone: "error" as const, text: activeServerError }
    : showFormatError
      ? { tone: "error" as const, text: USERNAME_FORMAT_MESSAGE }
      : taken
        ? { tone: "error" as const, text: `@${username} is already taken.` }
        : available
          ? { tone: "success" as const, text: `@${username} is available.` }
          : checking
            ? { tone: "muted" as const, text: "Checking availability…" }
            : null;

  const invalid = Boolean(activeServerError) || showFormatError || taken;

  return (
    <div className="grid gap-1.5 text-sm font-medium text-slate-800">
      <label htmlFor="onboarding-username">Username</label>
      <div className="relative">
        <input
          aria-invalid={invalid}
          autoComplete="username"
          className={`${inputClassName} pr-10 ${
            invalid ? "border-red-400 focus:border-red-500" : ""
          }`}
          id="onboarding-username"
          maxLength={24}
          name="username"
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            setValue(event.target.value);
            setServerErrorDismissed(true);
            if (!touched && event.target.value.length >= 3) {
              setTouched(true);
            }
          }}
          placeholder="e.g. marcobaggio"
          spellCheck={false}
          value={value}
        />
        <span
          aria-hidden
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm"
        >
          {available && !activeServerError ? "✅" : null}
          {taken || activeServerError ? "❌" : null}
        </span>
      </div>
      {liveMessage ? (
        <p
          className={`text-xs font-normal leading-relaxed ${
            liveMessage.tone === "error"
              ? "text-red-700"
              : liveMessage.tone === "success"
                ? "text-violet-700"
                : "text-slate-400"
          }`}
          role={liveMessage.tone === "error" ? "alert" : "status"}
        >
          {liveMessage.text}
        </p>
      ) : (
        <p className="text-xs font-normal leading-relaxed text-slate-500">
          Lowercase letters, numbers, and underscores.
        </p>
      )}
    </div>
  );
}
