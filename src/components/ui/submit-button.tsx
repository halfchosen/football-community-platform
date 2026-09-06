"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type SubmitButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  pendingLabel?: string;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// Submit button that reflects the enclosing form's pending state, giving every
// auth/onboarding form a real loading state without changing the server action.
export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
  size,
  disabled,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-busy={pending}
      className={className}
      disabled={pending || disabled}
      size={size}
      type="submit"
      variant={variant}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          {pendingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        d="M4 12a8 8 0 0 1 8-8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}
