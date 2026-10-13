import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DEVELOPMENT_RECOVERY_CALLBACK,
  recoveryAccessTokenFromFragment,
  sendDevelopmentOwnerRecoveryEmail,
  verifyDevelopmentRecoverySession,
  setDevelopmentOwnerPassword,
} from "../lib/shared-auth/development-owner-password-recovery.ts";
import {
  DEVELOPMENT_OWNER_AUTH_ORIGIN,
  OwnerEnrollmentDenied,
} from "../lib/shared-auth/development-owner-mfa.ts";
import { privateOperatorRouteDecision } from "../lib/command-center/operator-route-policy.ts";

const key = "sb_publishable_12345678901234567890";
const owner = "operator@example.com";
const subject = "a4730000-0000-4000-8000-000000000101";
const token = "header.payload.signature";
const password = "a-private-test-password-strong-enough";
const user = (overrides: Record<string, unknown> = {}) => ({
  id: subject,
  email: owner,
  email_confirmed_at: "2026-10-12T20:00:00Z",
  is_anonymous: false,
  app_metadata: {},
  ...overrides,
});
const recover = "/auth/v1/recover?redirect_to=" + encodeURIComponent(DEVELOPMENT_RECOVERY_CALLBACK);

function mock(reply: Array<{ path: string; method: string; body: unknown; status?: number }>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const retrieve: typeof fetch = async (url, init) => {
    const expect = reply.shift();
    assert.ok(expect, "unexpected provider request");
    assert.equal(String(url), DEVELOPMENT_OWNER_AUTH_ORIGIN + expect.path);
    assert.equal(init?.method, expect.method);
    assert.ok(init);
    calls.push({ url: String(url), init });
    return new Response(expect.status === 204 ? null : JSON.stringify(expect.body), {
      status: expect.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { retrieve, calls };
}

test("private recovery page is disabled, signed-operator gated and not a public auth service", () => {
  const page = readFileSync(new URL("../app/(prototype)/owner-password-recovery/page.tsx", import.meta.url), "utf8");
  const ui = readFileSync(new URL("../components/command-center/development-owner-password-recovery.tsx", import.meta.url), "utf8");
  const transport = readFileSync(new URL("../lib/shared-auth/development-owner-password-recovery.ts", import.meta.url), "utf8");
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  const proxy = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");

  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /revalidate = 0/);
  assert.match(page, /SEKINFRA_DEV_OWNER_PASSWORD_RECOVERY_ENABLED !== "true"/);
  assert.match(page, /SEKINFRA_DEPLOYMENT_ROLE !== "private-operator"/);
  assert.match(page, /authorizeOperator\(await headers\(\)\)/);
  assert.match(page, /if \(!operator\) notFound\(\)/);
  assert.match(page, /validDevelopmentPublishableKey\(key\)/);
  assert.match(page, /index: false, follow: false/);
  assert.equal(privateOperatorRouteDecision("/owner-password-recovery"), "forward");
  for (const denied of ["/owner-password-recovery/", "/owner-password-recovery/api",
    "/auth/callback", "/api/password-reset", "/start", "/auth"]) {
    assert.equal(privateOperatorRouteDecision(denied), "deny");
  }
  assert.match(proxy, /privateOperatorRouteDecision/);
  assert.match(config, /source: "\/owner-password-recovery"/);
  assert.match(config, /no-referrer/);
  assert.match(config, /no-store/);
  assert.match(ui, /window\.location\.hash/);
  assert.match(ui, /window\.history\.replaceState/);
  assert.match(ui, /useRef<string \| null>/);
  assert.doesNotMatch(page + ui + transport, /localStorage|sessionStorage|document\.cookie|console\.|navigator\.sendBeacon/);
  assert.doesNotMatch(page + ui + transport, /service_role|sb_secret_|NEXT_PUBLIC_|\/rest\/v1\/|\bn8n\b/);
});

test("callback is exact and no query, missing type, duplicate tokens or wrong-type fragments accepted", () => {
  assert.equal(DEVELOPMENT_RECOVERY_CALLBACK, "https://dashboard.sekinfra.com/owner-password-recovery");
  assert.equal(recoveryAccessTokenFromFragment(`#access_token=${token}&type=recovery&refresh_token=private-not-read`), token);
  for (const invalid of [
    "", "access_token=" + token + "&type=recovery", "#access_token=" + token,
    "#access_token=" + token + "&type=signup", "#access_token=" + token + "&type=magiclink",
    "#access_token=" + token + "&type=recovery&type=recovery",
    "#access_token=" + token + "&type=recovery&access_token=" + token,
    "#access_token=not-jwt&type=recovery",
  ]) assert.equal(recoveryAccessTokenFromFragment(invalid), null);
});

test("owner email recovery is scoped to one provider and explicit callback", async () => {
  const net = mock([{ path: recover, method: "POST", body: {} }]);
  await sendDevelopmentOwnerRecoveryEmail(key, owner, net.retrieve);
  assert.equal(net.calls.length, 1);
  const [call] = net.calls;
  assert.deepEqual(JSON.parse(call.init.body as string), { email: owner });
  assert.equal(call.init.cache, "no-store");
  assert.equal(call.init.credentials, "omit");
  assert.equal(call.init.redirect, "error");
  assert.equal(call.init.referrerPolicy, "no-referrer");
  assert.ok(!JSON.stringify(call.init).includes("refresh_token"));
});

test("recovery identity must be confirmed, unbound, exact signed owner", async () => {
  const allowed = mock([{ path: "/auth/v1/user", method: "GET", body: user() }]);
  assert.equal(await verifyDevelopmentRecoverySession(key, owner, token, allowed.retrieve), subject);
  assert.equal((allowed.calls[0].init.headers as Record<string, string>).Authorization, `Bearer ${token}`);
  for (const override of [
    { email: "someone-else@example.com" },
    { email_confirmed_at: null },
    { is_anonymous: true },
    { id: "wrong-subject" },
    { app_metadata: { avuhz_tenant_id: subject } },
    { app_metadata: { avuhz_workload: "test" } },
  ]) {
    const net = mock([{ path: "/auth/v1/user", method: "GET", body: user(override) }]);
    await assert.rejects(verifyDevelopmentRecoverySession(key, owner, token, net.retrieve), OwnerEnrollmentDenied);
    assert.equal(net.calls.length, 1);
  }
});

test("password change rechecks owner, updates existing AUTH user and locally revokes temporary session", async () => {
  const net = mock([
    { path: "/auth/v1/user", method: "GET", body: user() },
    { path: "/auth/v1/user", method: "PUT", body: user() },
    { path: "/auth/v1/logout?scope=local", method: "POST", body: null, status: 204 },
  ]);
  assert.deepEqual(await setDevelopmentOwnerPassword(key, owner, token, password, net.retrieve),
    { temporarySessionRevoked: true });
  assert.equal(net.calls.length, 3);
  assert.deepEqual(JSON.parse(net.calls[1].init.body as string), { password });
  assert.equal(net.calls[1].init.credentials, "omit");
  assert.equal(net.calls[1].init.referrerPolicy, "no-referrer");
  assert.equal((net.calls[1].init.headers as Record<string, string>).Authorization, `Bearer ${token}`);
});

test("does not misreport successful password change when temporary logout failed", async () => {
  const net = mock([
    { path: "/auth/v1/user", method: "GET", body: user() },
    { path: "/auth/v1/user", method: "PUT", body: user() },
    { path: "/auth/v1/logout?scope=local", method: "POST", body: {}, status: 503 },
  ]);
  assert.deepEqual(await setDevelopmentOwnerPassword(key, owner, token, password, net.retrieve),
    { temporarySessionRevoked: false });
});

test("invalid input and wrong identity never make a password mutation", async () => {
  const unreachable = (async () => { throw new Error("should not contact provider"); }) as typeof fetch;
  for (const candidate of ["short", "", "x".repeat(129)]) {
    await assert.rejects(setDevelopmentOwnerPassword(key, owner, token, candidate, unreachable), OwnerEnrollmentDenied);
  }
  await assert.rejects(
    setDevelopmentOwnerPassword(key, owner, "not-a-jwt", password, unreachable),
    OwnerEnrollmentDenied,
  );
  const wrong = mock([{ path: "/auth/v1/user", method: "GET", body: user({ email: "attacker@example.com" }) }]);
  await assert.rejects(setDevelopmentOwnerPassword(key, owner, token, password, wrong.retrieve), OwnerEnrollmentDenied);
  assert.equal(wrong.calls.length, 1);
  const failedMutation = mock([
    { path: "/auth/v1/user", method: "GET", body: user() },
    { path: "/auth/v1/user", method: "PUT", body: {}, status: 401 },
  ]);
  await assert.rejects(setDevelopmentOwnerPassword(key, owner, token, password, failedMutation.retrieve), OwnerEnrollmentDenied);
  assert.equal(failedMutation.calls.length, 2);
});

test("provider denial never pretends a recovery email was delivered", async () => {
  const failed = mock([{ path: recover, method: "POST", body: {}, status: 429 }]);
  await assert.rejects(sendDevelopmentOwnerRecoveryEmail(key, owner, failed.retrieve), OwnerEnrollmentDenied);
});
