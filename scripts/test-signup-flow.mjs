import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

// Exercise the actual server action with an isolated provider: no auth requests,
// real accounts, emails or Next.js server are needed for these privacy checks.
function loadModule(path, dependencies = {}) {
  const source = readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    process: { env: { NODE_ENV: "test" } },
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const messages = loadModule("lib/auth/messages.ts");
const validation = loadModule("lib/auth/validation.ts");
const config = loadModule("lib/auth/config.ts");

async function submit(response) {
  const calls = [];
  const { signup } = loadModule("server/actions/auth/signup.ts", {
    "@/lib/community/legal": { isCommunityLaunchReady: () => true },
    "next/navigation": { redirect: (url) => { throw new Error(url); } },
    "@/lib/auth/config": config,
    "@/lib/auth/messages": messages,
    "@/lib/auth/validation": validation,
    "@/lib/auth/site-url": { getAuthRedirectUrl: async (path) => `https://example.test${path}` },
    "@/lib/supabase/server": {
      createClient: async () => ({ auth: {
        signUp: async (input) => { calls.push(input); return response; },
        resetPasswordForEmail: async () => assert.fail("Signup must not send a reset email"),
      } }),
    },
  });
  const form = new FormData();
  form.set("email", "supporter@example.test");
  form.set("password", "ExamplePassword!42");
  form.set("confirmPassword", "ExamplePassword!42");
  form.set("signupTerms", "on");
  let destination;
  await assert.rejects(signup(form), (error) => {
    destination = error.message;
    return destination.startsWith("/signup?");
  });
  assert.equal(calls.length, 1);
  return new URL(destination, "https://example.test");
}

const accepted = { data: { user: { identities: [{ provider: "email" }] } }, error: null };
const duplicate = { data: { user: { identities: [] } }, error: null };
for (const [name, response] of [
  ["new signup", accepted],
  ["obfuscated duplicate", duplicate],
  ...["user_already_exists", "email_exists", "identity_already_exists"]
    .map((code) => [code, { error: { code } }]),
]) {
  test(`${name} gets the same neutral result without an automatic reset`, async () => {
    const result = await submit(response);
    assert.equal(result.searchParams.get("message"), messages.SIGNUP_NEUTRAL_MESSAGE);
    assert.equal(result.searchParams.has("error"), false);
    assert.equal(result.searchParams.has("email"), false);
  });
}

for (const code of ["captcha_failed", "over_email_send_rate_limit"]) {
  test(`${code} remains an actionable error`, async () => {
    const result = await submit({ error: { code } });
    assert.ok(result.searchParams.get("error"));
    assert.equal(result.searchParams.has("message"), false);
  });
}
