import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-stone-900">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-stone-500">{hint}</span> : null}
    </label>
  );
}

export function Input({ label, hint, className, ...props }: InputProps) {
  return (
    <Field hint={hint} label={label}>
      <input
        className={`h-11 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 ${className ?? ""}`}
        {...props}
      />
    </Field>
  );
}

export function Select({ label, hint, className, children, ...props }: SelectProps) {
  return (
    <Field hint={hint} label={label}>
      <select
        className={`h-11 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 ${className ?? ""}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
