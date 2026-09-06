"use client";
import {
  createContext,
  useContext,
  useId,
  useState,
  type FormHTMLAttributes,
} from "react";
const ValidationContext = createContext<Record<string, string>>({});
export function useFormFieldError(name?: string) {
  const errors = useContext(ValidationContext);
  return name ? errors[name] : undefined;
}
export function ValidatedForm({
  children,
  onSubmit,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const id = useId();
  return (
    <ValidationContext value={errors}>
      <form
        {...props}
        noValidate
        aria-describedby={Object.keys(errors).length ? id : undefined}
        onInput={(event) => {
          const input = event.target as HTMLInputElement;
          if (input.name && errors[input.name])
            setErrors((current) => {
              const next = { ...current };
              delete next[input.name];
              return next;
            });
        }}
        onSubmit={(event) => {
          const form = event.currentTarget;
          const next: Record<string, string> = {};
          let first: HTMLElement | null = null;
          for (const element of Array.from(form.elements)) {
            if (
              !(
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement ||
                element instanceof HTMLSelectElement
              ) ||
              !element.name ||
              element.disabled ||
              element.validity.valid
            )
              continue;
            next[element.name] = element.validity.valueMissing
              ? "Complete this field to continue."
              : element.validity.typeMismatch
                ? element instanceof HTMLInputElement && element.type === "url"
                  ? "Enter a valid link, including https://."
                  : "Enter a valid email address."
                : element.validationMessage;
            first ??= element;
          }
          const password = form.elements.namedItem("password"),
            confirmation = form.elements.namedItem("confirmPassword");
          if (
            password instanceof HTMLInputElement &&
            confirmation instanceof HTMLInputElement &&
            password.value !== confirmation.value
          ) {
            next.confirmPassword = "The passwords do not match.";
            first ??= confirmation;
          }
          setErrors(next);
          if (Object.keys(next).length) {
            event.preventDefault();
            first?.focus({ preventScroll: true });
            first?.scrollIntoView({ block: "nearest" });
            return;
          }
          onSubmit?.(event);
        }}
      >
        {Object.keys(errors).length > 0 && (
          <p
            id={id}
            role="alert"
            className="mb-1 rounded-md border border-danger-line bg-danger-wash px-3 py-2 text-xs font-medium leading-5 text-danger"
          >
            Check the highlighted fields before continuing.
          </p>
        )}
        {children}
      </form>
    </ValidationContext>
  );
}
