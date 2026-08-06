import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth/redirect-path";
import { createClient } from "@/lib/supabase/server";

const emailOtpTypes = new Set<string>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return value !== null && emailOtpTypes.has(value);
}

function getAuthErrorPath(next: string, type: string | null) {
  const isRecovery = next === "/update-password" || type === "recovery";
  const pathname = isRecovery ? "/reset-password" : "/login";
  const message = isRecovery
    ? "This password reset link is invalid or expired. Request a new link and try again."
    : "This authentication link is invalid or expired. Please try again.";

  return `${pathname}?error=${encodeURIComponent(message)}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = getSafeRedirectPath(
    requestUrl.searchParams.get("next"),
    "/app",
  );
  const supabase = await createClient();

  if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL(getAuthErrorPath(next, type), requestUrl.origin),
  );
}
