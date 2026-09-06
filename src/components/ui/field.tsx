"use client";
import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { useFormFieldError } from "./validated-form";
type FieldProps = { label: string; hint?: string; children: ReactNode };
export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
      <span>{label}</span>
      {children}
      {hint && (
        <span className="text-xs font-normal leading-5 text-slate-500">
          {hint}
        </span>
      )}
    </label>
  );
}
export const inputClassName =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-foreground outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal focus:ring-2 focus:ring-mint aria-invalid:border-rose-500";
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
  const uid = useId(),
    formError = useFormFieldError(props.name);
  const message = error ?? formError;
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
      <span>{label}</span>
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
        <span
          id={`${uid}-hint`}
          className="text-xs font-normal leading-5 text-slate-500"
        >
          {hint}
        </span>
      )}
      {message && (
        <span
          id={`${uid}-error`}
          className="text-xs font-normal leading-5 text-rose-700"
        >
          {message}
        </span>
      )}
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
      <select {...props} className={`${inputClassName} ${className ?? ""}`}>
        {children}
      </select>
    </Field>
  );
}
