export function getSafeRedirectPath(
  value: string | null,
  fallback: `/${string}`,
) {
  if (!value?.startsWith("/")) {
    return fallback;
  }

  const baseUrl = new URL("https://safe-redirect.invalid");
  const resolvedUrl = new URL(value, baseUrl);

  if (resolvedUrl.origin !== baseUrl.origin) {
    return fallback;
  }

  return `${resolvedUrl.pathname}${resolvedUrl.search}${resolvedUrl.hash}`;
}
