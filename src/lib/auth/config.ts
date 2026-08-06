export function isGoogleAuthEnabled() {
  return process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
}

export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;
}

export function isCaptchaEnabled() {
  return getTurnstileSiteKey() !== null;
}

export function getCaptchaToken(formData: FormData): string | undefined {
  const token = String(formData.get("captchaToken") ?? "").trim();
  return token || undefined;
}

export function validateCaptchaToken(token: string | undefined) {
  if (isCaptchaEnabled() && !token) {
    return "Complete the security check and try again.";
  }

  return null;
}
