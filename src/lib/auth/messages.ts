type AuthErrorLike = {
  code?: string;
  status?: number;
};

export const SIGNUP_NEUTRAL_MESSAGE =
  "If this email can be registered, we sent a confirmation link. If you already have an account, log in or reset your password.";

export const RESET_NEUTRAL_MESSAGE =
  "If an account exists for this email, we sent a password reset link.";

export const RESEND_NEUTRAL_MESSAGE =
  "If this account is awaiting confirmation, we sent a new confirmation link.";

function getCode(error: AuthErrorLike) {
  return error.code ?? "";
}

export function getLoginErrorMessage(error: AuthErrorLike) {
  switch (getCode(error)) {
    case "email_not_confirmed":
      return "Confirm your email before logging in. You can request a new confirmation email below.";
    case "captcha_failed":
      return "The security check failed. Please try again.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    case "weak_password":
      return "This password no longer meets the account security policy. Reset it to continue.";
    default:
      return "Email or password is incorrect.";
  }
}

export function getEmailActionErrorMessage(error: AuthErrorLike) {
  switch (getCode(error)) {
    case "captcha_failed":
      return "The security check failed. Please try again.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many email requests. Wait a few minutes and try again.";
    default:
      return null;
  }
}

export function getPasswordUpdateErrorMessage(error: AuthErrorLike) {
  switch (getCode(error)) {
    case "same_password":
      return "Choose a password you have not used for this account.";
    case "weak_password":
      return "This password does not meet the account security policy.";
    case "reauthentication_needed":
    case "reauthentication_not_valid":
      return "Your verification expired. Sign in again and retry.";
    case "invalid_credentials":
      return "Your current password is incorrect.";
    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    default:
      return "We could not update your password. Please try again.";
  }
}

export function isEnumerationSafeSignupError(error: AuthErrorLike) {
  return ["user_already_exists", "email_exists", "identity_already_exists"].includes(
    getCode(error),
  );
}

export function getSignupErrorMessage(error: AuthErrorLike) {
  if (isEnumerationSafeSignupError(error)) {
    return null;
  }

  switch (getCode(error)) {
    case "captcha_failed":
      return "The security check failed. Please try again.";
    case "weak_password":
      return "This password does not meet the account security policy.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    case "email_address_invalid":
    case "validation_failed":
      return "Enter a valid email address and try again.";
    default:
      return "We could not create the account. Please try again.";
  }
}
