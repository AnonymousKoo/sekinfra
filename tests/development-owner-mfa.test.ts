import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DEVELOPMENT_OWNER_AUTH_ORIGIN,
  OwnerEnrollmentDenied,
  authenticateDevelopmentOwner,
  beginTotpEnrollment,
  verifyTotpEnrollment,
  validDevelopmentPublishableKey,
  type OwnerSession,
} from "../lib/shared-auth/development-owner-mfa.ts";
import { privateOperatorRouteDecision } from "../lib/command-center/operator-route-policy.ts";

const key = "sb_publishable_12345678901234567890";
const email = "operator@example.com";
const subject = "a4730000-0000-4000-8000-000000000101";
const other = "a4730000-0000-4000-8000-000000000999";
const factorId = "a4730000-0000-4000-8000-000000000102";
const challengeId = "a4730000-0000-4000-8000-000000000103";
const token = "header.payload.signature";
const stepUpToken = "header.stepup.signature";
const session: OwnerSession = { subject, accessToken: token, factorId: null };

const user = (overrides: Record<string, unknown> = {}) => ({
  id: subject,
  email,
  email_confirmed_at: "2026-10-12T20:00:00Z",
  app_metadata: {},
  is_anonymous: false,
  factors: [],
  ...overrides,
});

function mock(
  reply: Array<{ path: string; result: unknown; status?: number }>,
) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const retrieve: typeof fetch = async (target, init) => {
    const url = String(target);
    const entry = reply.shift();
    assert.ok(entry, "unexpected request");
    assert.equal(url, DEVELOPMENT_OWNER_AUTH_ORIGIN + entry.path);
    assert.ok(init, "request options required");
    calls.push({ url, init });
    return new Response(JSON.stringify(entry.result), {
      status: entry.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { retrieve, calls, remaining: reply };
}

test("private route is not public or another login infrastructure", () => {
  const route = readFileSync(new URL("../app/(prototype)/owner-enrollment/page.tsx", import.meta.url), "utf8");
  const client = readFileSync(new URL("../components/command-center/development-owner-mfa-setup.tsx", import.meta.url), "utf8");
  const transport = readFileSync(new URL("../lib/shared-auth/development-owner-mfa.ts", import.meta.url), "utf8");
  const routePolicy = readFileSync(new URL("../lib/command-center/operator-route-policy.ts", import.meta.url), "utf8");
  const proxy = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
  const nextConfig = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");

  assert.match(route, /dynamic = "force-dynamic"/);
  assert.match(route, /SEKINFRA_DEV_OWNER_MFA_ENABLED !== "true"/);
  assert.match(route, /SEKINFRA_DEPLOYMENT_ROLE !== "private-operator"/);
  assert.match(route, /authorizeOperator\(await headers\(\)\)/);
  assert.match(route, /if \(!operator\) notFound\(\)/);
  assert.match(route, /validDevelopmentPublishableKey\(key\)/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_|service_role|createClient\(|\bGRANT\b|createUser/);
  assert.match(routePolicy, /pathname === "\/owner-enrollment"/);
  assert.match(proxy, /privateOperatorRouteDecision/);
  assert.equal(privateOperatorRouteDecision("/owner-enrollment"), "forward");
  assert.equal(privateOperatorRouteDecision("/owner-enrollment/"), "deny");
  assert.equal(privateOperatorRouteDecision("/owner-enrollment/api"), "deny");
  assert.equal(privateOperatorRouteDecision("/auth/callback"), "deny");
  assert.match(nextConfig, /source: "\/owner-enrollment"/);
  assert.match(nextConfig, /no-referrer/);
  assert.match(nextConfig, /no-store/);
  assert.match(client, /useRef<OwnerSession \| null>/);
  assert.doesNotMatch(client + transport, /localStorage|sessionStorage|document\.cookie|navigator\.sendBeacon|console\.|refresh_token\s*=/);
  assert.doesNotMatch(client + transport, /n8n|service_role|SECRET_KEY|\/rest\/v1\//);
});

test("exact publishable key and one DEVELOPMENT AUTH origin only", () => {
  assert.equal(DEVELOPMENT_OWNER_AUTH_ORIGIN, "https://pwlhruwutoitnieactol.supabase.co");
  assert.equal(validDevelopmentPublishableKey(key), true);
  for (const invalid of [null, "", "ey.fake.jwt", "sb_secret_abcdefghijklmnopqrst",
    "service_role", "sb_publishable_short", "sb_publishable_invalid!"]) {
    assert.equal(validDevelopmentPublishableKey(invalid), false);
  }
});

test("signed owner is checked against verified Supabase user, not browser input", async () => {
  const net = mock([
    { path: "/auth/v1/token?grant_type=password", result: { access_token: token } },
    { path: "/auth/v1/user", result: user() },
  ]);
  const authenticated = await authenticateDevelopmentOwner(
    key, email, "private-test-password", net.retrieve,
  );
  assert.deepEqual(authenticated, session);
  assert.equal(net.calls.length, 2);
  assert.equal(net.calls[0].init.method, "POST");
  assert.equal(net.calls[1].init.method, "GET");
  for (const { url, init } of net.calls) {
    assert.ok(url.startsWith(DEVELOPMENT_OWNER_AUTH_ORIGIN));
    assert.equal(init.cache, "no-store");
    assert.equal(init.credentials, "omit");
    assert.equal(init.redirect, "error");
    assert.equal(init.referrerPolicy, "no-referrer");
    assert.ok(!JSON.stringify(init).includes("refresh_token"));
  }
  const raw = JSON.parse(net.calls[0].init.body as string);
  assert.deepEqual(raw, { email, password: "private-test-password" });
  assert.equal((net.calls[1].init.headers as Record<string, string>).Authorization,
    `Bearer ${token}`);
});

test("wrong owner, tenant binding, anonymous and unconfirmed users fail closed", async () => {
  for (const partial of [
    { id: other },
    { email: "wrong@example.com" },
    { email_confirmed_at: null },
    { app_metadata: { avuhz_tenant_id: subject } },
    { app_metadata: { avuhz_workload: "test" } },
    { is_anonymous: true },
    { factors: [{ id: factorId, factor_type: "totp", status: "unverified" }] },
  ]) {
    const net = mock([
      { path: "/auth/v1/token?grant_type=password", result: { access_token: token } },
      { path: "/auth/v1/user", result: user(partial) },
    ]);
    await assert.rejects(
      authenticateDevelopmentOwner(key, email, "private-test-password", net.retrieve),
      OwnerEnrollmentDenied,
    );
  }
});

test("already verified TOTP factor prevents duplicate factor creation", async () => {
  const net = mock([
    { path: "/auth/v1/token?grant_type=password", result: { access_token: token } },
    { path: "/auth/v1/user", result: user({
      factors: [{ id: factorId, factor_type: "totp", status: "verified" }],
    }) },
  ]);
  const owned = await authenticateDevelopmentOwner(key, email, "password", net.retrieve);
  assert.equal(owned.factorId, factorId);
  await assert.rejects(beginTotpEnrollment(key, owned, net.retrieve), OwnerEnrollmentDenied);
  assert.equal(net.calls.length, 2);
});

test("TOTP enrollment is strictly authenticated and displays no remote QR source", async () => {
  const net = mock([{ path: "/auth/v1/factors", result: {
    id: factorId,
    totp: { secret: "ABCDEFGHIJKLMNOP234567", qr_code: "https://attacker.example.com/totp.png" },
  } }]);
  const enrollment = await beginTotpEnrollment(key, session, net.retrieve);
  assert.deepEqual(enrollment, {
    factorId, secret: "ABCDEFGHIJKLMNOP234567", qrCode: null,
  });
  assert.deepEqual(JSON.parse(net.calls[0].init.body as string), {
    factor_type: "totp", friendly_name: "Development owner authenticator",
  });
  assert.equal((net.calls[0].init.headers as Record<string, string>).Authorization,
    `Bearer ${token}`);
});

test("challenge + verification requires exact owner and verified TOTP factor", async () => {
  const net = mock([
    { path: `/auth/v1/factors/${factorId}/challenge`, result: { id: challengeId } },
    { path: `/auth/v1/factors/${factorId}/verify`, result: { access_token: stepUpToken } },
    { path: "/auth/v1/user", result: user({
      factors: [{ id: factorId, factor_type: "totp", status: "verified" }],
    }) },
  ]);
  assert.equal(await verifyTotpEnrollment(
    key, session, factorId, "123456", email, net.retrieve,
  ), true);
  assert.equal(net.calls.length, 3);
  assert.deepEqual(JSON.parse(net.calls[1].init.body as string), {
    challenge_id: challengeId, code: "123456",
  });
  assert.equal((net.calls[2].init.headers as Record<string, string>).Authorization,
    `Bearer ${stepUpToken}`);
});

test("wrong MFA response, provider failure and invalid code never return success", async () => {
  await assert.rejects(
    verifyTotpEnrollment(key, session, factorId, "12345", email,
      (async () => { throw new Error("network must not be reached"); }) as typeof fetch),
    OwnerEnrollmentDenied,
  );
  const denied = mock([
    { path: `/auth/v1/factors/${factorId}/challenge`, result: { id: challengeId } },
    { path: `/auth/v1/factors/${factorId}/verify`, result: { access_token: stepUpToken } },
    { path: "/auth/v1/user", result: user({
      factors: [{ id: factorId, factor_type: "totp", status: "unverified" }],
    }) },
  ]);
  assert.equal(await verifyTotpEnrollment(
    key, session, factorId, "123456", email, denied.retrieve,
  ), false);
  const missing = mock([
    { path: `/auth/v1/factors/${factorId}/challenge`, result: {}, status: 401 },
  ]);
  await assert.rejects(
    verifyTotpEnrollment(key, session, factorId, "123456", email, missing.retrieve),
    OwnerEnrollmentDenied,
  );
});
