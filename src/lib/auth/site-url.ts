import { headers } from "next/headers";

function getValidOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export async function getAuthRedirectUrl(pathname: string) {
  const configuredOrigin = getValidOrigin(process.env.NEXT_PUBLIC_SITE_URL);

  if (process.env.NODE_ENV === "production") {
    if (!configuredOrigin) {
      throw new Error("NEXT_PUBLIC_SITE_URL must be configured in production.");
    }

    return new URL(pathname, configuredOrigin).toString();
  }

  const requestOrigin = getValidOrigin((await headers()).get("origin"));
  const origin = configuredOrigin ?? requestOrigin;

  if (!origin) {
    return new URL(pathname, "http://localhost:3000").toString();
  }

  return new URL(pathname, origin).toString();
}
