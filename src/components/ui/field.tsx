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
    <label className="grid gap-1.5 text-sm font-medium text-slate-800">
      <span>{label}</span>
      {children}
      {hint ? (
        <span className="text-xs font-normal leading-relaxed text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export const inputClassName =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-[0_1px_0_rgba(0,0,0,0.02)] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10";

export function Input({ label, hint, className, ...props }: InputProps) {
  return (
    <Field hint={hint} label={label}>
      <input className={`${inputClassName} ${className ?? ""}`} {...props} />
    </Field>
  );
}

export function Select({ label, hint, className, children, ...props }: SelectProps) {
  return (
    <Field hint={hint} label={label}>
      <div className="relative">
        <select
          className={`${inputClassName} cursor-pointer appearance-none pr-10 ${className ?? ""}`}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Field>
  );
}
