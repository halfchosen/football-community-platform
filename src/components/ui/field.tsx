"use client";
import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { useFormFieldError } from "./validated-form";
import { AlertIcon } from "./icons";

const labelClassName = "text-[13px] font-semibold text-ink";
const hintClassName = "text-xs font-normal leading-5 text-ink-3";

export const inputClassName =
  "h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-navy focus:ring-2 focus:ring-navy/12 aria-invalid:border-danger aria-invalid:ring-danger/10";

export function FieldError({ message, id }: { message: string; id?: string }) {
  return (
    <span
      className="flex items-start gap-1.5 text-xs font-medium leading-5 text-danger"
      id={id}
      role="alert"
    >
      <AlertIcon size={14} className="mt-px shrink-0" />
      {message}
    </span>
  );
}

type FieldProps = { label: string; hint?: string; children: ReactNode };

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className={labelClassName}>{label}</span>
      {children}
      {hint && <span className={hintClassName}>{hint}</span>}
    </label>
  );
}

export function Input({
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const uid = useId();
  const formError = useFormFieldError(props.name);
  const message = error ?? formError;

  return (
    <label className="grid gap-1.5">
      <span className={labelClassName}>{label}</span>
      <input
        {...props}
        id={props.id ?? uid}
        aria-invalid={Boolean(message) || props["aria-invalid"]}
        aria-describedby={
          [
            props["aria-describedby"],
            hint ? `${uid}-hint` : null,
            message ? `${uid}-error` : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={`${inputClassName} ${className ?? ""}`}
      />
      {hint && (
        <span id={`${uid}-hint`} className={hintClassName}>
          {hint}
        </span>
      )}
      {message && <FieldError id={`${uid}-error`} message={message} />}
    </label>
  );
}

export function Select({
  label,
  hint,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      <select {...props} className={`${inputClassName} pr-8 ${className ?? ""}`}>
        {children}
      </select>
    </Field>
  );
}

/** Shared textarea styling so composers and forms match. */
export const textareaClassName =
  "w-full resize-y rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-4 hover:border-ink-4 focus:border-navy focus:ring-2 focus:ring-navy/12";
