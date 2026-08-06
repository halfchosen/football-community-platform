export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const EMAIL_MAX_LENGTH = 254;

export const PASSWORD_REQUIREMENTS =
  "At least 8 characters, including uppercase, lowercase, a number, and a symbol.";

export function getPasswordRequirementStatus(password: string) {
  return [
    {
      key: "length",
      label: `${PASSWORD_MIN_LENGTH}+ characters`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      key: "uppercase",
      label: "Uppercase",
      met: /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: "Lowercase",
      met: /[a-z]/.test(password),
    },
    {
      key: "number",
      label: "Number",
      met: /[0-9]/.test(password),
    },
    {
      key: "symbol",
      label: "Symbol",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ] as const;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return "Enter your email address.";
  }

  if (email.length > EMAIL_MAX_LENGTH || !emailPattern.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be no more than ${PASSWORD_MAX_LENGTH} characters.`;
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }

  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a symbol.";
  }

  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | null {
  return password === confirmation ? null : "Passwords do not match.";
}
