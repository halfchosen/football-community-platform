const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const productionMode = process.env.SMOKE_PRODUCTION === "1";

const checks = [
  { path: "/", status: 200 },
  { path: "/community", status: 200 },
  { path: "/legal/terms", status: 200 },
  { path: "/legal/privacy", status: 200 },
  { path: "/legal/rules", status: 200 },
  { path: "/legal/missing", status: 404 },
  { path: "/api/community/trending", status: 200 },
  { path: "/api/account/export", status: 401 },
  { path: "/api/forum/invalid/replies", status: 400 },
  { path: "/api/forum/invalid/contributions", status: 400 },
  ...[
    "/me/activity",
    "/me/saved",
    "/me/notifications",
    "/me/reports",
    "/admin/reports",
    "/admin/members",
    "/agreements",
    "/account/recovery",
  ].map((path) => ({ path, status: 307, location: "/login" })),
  { path: "/login", status: 200 },
  { path: "/signup", status: 200 },
  { path: "/resend-confirmation", status: 200 },
  { path: "/reset-password", status: 200 },
  { path: "/update-password", status: 307, location: "/reset-password" },
  {
    path: "/auth/callback?next=/update-password",
    status: 307,
    location: "/reset-password",
  },
  {
    path: "/auth/callback?next=//example.com",
    status: 307,
    location: "/login",
  },
  { path: "/forum", status: 307, location: "/" },
  {
    path: "/forum/example-topic",
    status: 307,
    location: "/?topic=example-topic",
  },
  { path: "/app", status: 307, location: "/login" },
  { path: "/onboarding", status: 307, location: "/login" },
  { path: "/forum/new", status: 307, location: "/login" },
  { path: "/settings/profile", status: 307, location: "/login" },
  { path: "/settings/account", status: 307, location: "/login" },
  { path: "/preview", status: productionMode ? 404 : 200 },
  ...[
    "/zzpreview",
    "/zzpreview/feed",
    "/zzpreview/feed/topic",
    "/zzpreview/forum-new",
    "/zzpreview/onboarding",
    "/zzpreview/profile",
    "/zzpreview/settings-profile",
    "/zzpreview/settings-account",
  ].map((path) => ({ path, status: 404 })),
];

const failures = [];

for (const check of checks) {
  const response = await fetch(new URL(check.path, baseUrl), {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  const location = response.headers.get("location");

  if (response.status !== check.status) {
    failures.push(
      `${check.path}: expected ${check.status}, received ${response.status}`,
    );
    continue;
  }

  const resolvedLocation = location ? new URL(location, baseUrl) : null;
  const locationPath = resolvedLocation
    ? check.location?.includes("?")
      ? `${resolvedLocation.pathname}${resolvedLocation.search}`
      : resolvedLocation.pathname
    : null;

  if (check.location && locationPath !== check.location) {
    failures.push(
      `${check.path}: expected redirect to ${check.location}, received ${locationPath ?? "no location"}`,
    );
  }
}

if (failures.length > 0) {
  console.error(`Route smoke test failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(
    `Route smoke test passed (${checks.length} checks, ${productionMode ? "production" : "development"} mode).`,
  );
}
