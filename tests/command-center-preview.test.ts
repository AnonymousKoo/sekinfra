import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, sign } from "node:crypto";

import { authorizeOperator } from "../lib/command-center/operator-access.ts";

const page = readFileSync(new URL("../app/(prototype)/command-center/page.tsx", import.meta.url), "utf8");
const auth = readFileSync(new URL("../lib/command-center/operator-access.ts", import.meta.url), "utf8");
const now = 1_800_000_000;
const issuer = "https://sek-test.cloudflareaccess.com";
const audience = "testaudienceabcdefghijklmnopqrst";
const owner = "operator@example.com";
const env = {
  SEKINFRA_COMMAND_CENTER_ENABLED: "true",
  SEKINFRA_OPERATOR_HOST: "dashboard.sekinfra.com",
  SEKINFRA_ACCESS_TEAM_DOMAIN: issuer,
  SEKINFRA_ACCESS_AUD: audience,
  SEKINFRA_OPERATOR_EMAIL: owner,
};

const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: "jwk" }), kid: "verified-key", alg: "RS256", use: "sig" };
let certificateFetchCount = 0;
const retrieve = (async () => {
  certificateFetchCount += 1;
  return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 });
}) as typeof fetch;

function signedToken(claimOverrides: Record<string, unknown> = {}, headerOverrides: Record<string, unknown> = {}) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "verified-key", ...headerOverrides })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({
    iss: issuer,
    aud: [audience],
    exp: now + 3600,
    iat: now - 100,
    nbf: now - 100,
    sub: "private-operator-id",
    email: owner,
    ...claimOverrides,
  })).toString("base64url");
  const signature = sign("RSA-SHA256", Buffer.from(`${header}.${claims}`), privateKey).toString("base64url");
  return `${header}.${claims}.${signature}`;
}

function request(token: string, host = "dashboard.sekinfra.com") {
  return new Headers({ host, "cf-access-jwt-assertion": token });
}

test("command center is private and has no synthetic portfolio or command facade", () => {
  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /revalidate = 0/);
  assert.match(page, /index: false, follow: false/);
  assert.match(page, /authorizeOperator\(await headers\(\)\)/);
  assert.match(page, /if \(!identity\) notFound\(\)/);
  assert.doesNotMatch(page, /orderedWorkspaceEngagements|oiaWorkspaceFixture|CommandCenterExperience|fixtures\/oia-workspace/);
  assert.doesNotMatch(page, /service_role|SUPABASE_SERVICE|Authorization:\s*Bearer/);
  assert.match(page, /client.*not connected/i);
  assert.match(page, /cache: "no-store"/);
});

test("operator access requires a valid Cloudflare signature, audience, issuer, owner and private host", async () => {
  const identity = await authorizeOperator(request(signedToken()), env, retrieve, now);
  assert.deepEqual(identity, { subject: "private-operator-id", email: owner });
});

test("operator access fails closed before network contact for invalid input and configuration", async () => {
  const initial = certificateFetchCount;
  const scenarios: Array<[Headers, Record<string, string>]> = [
    [request(signedToken()), { ...env, SEKINFRA_COMMAND_CENTER_ENABLED: "false" }],
    [request(signedToken()), { ...env, SEKINFRA_OPERATOR_HOST: "www.sekinfra.com" }],
    [request(signedToken(), "sekinfra-website.vercel.app"), env],
    [request(signedToken(), "www.sekinfra.com"), env],
    [request(signedToken()), { ...env, SEKINFRA_OPERATOR_EMAIL: "" }],
    [request(signedToken()), { ...env, SEKINFRA_ACCESS_TEAM_DOMAIN: "https://evil.example.com" }],
    [request(signedToken()), { ...env, SEKINFRA_ACCESS_AUD: "" }],
    [request("not-a-token"), env],
    [request(signedToken({ iss: "https://attacker.cloudflareaccess.com" })), env],
    [request(signedToken({ aud: ["wrong-audience"] })), env],
    [request(signedToken({ exp: now - 1 })), env],
    [request(signedToken({ nbf: now + 500 })), env],
    [request(signedToken({ email: "someone-else@example.com" })), env],
    [request(signedToken({}, { alg: "none" })), env],
  ];
  for (const [headers, settings] of scenarios) {
    assert.equal(await authorizeOperator(headers, settings, retrieve, now), null);
  }
  assert.equal(certificateFetchCount, initial);
});

test("operator access rejects forged signatures, missing cert keys and JWKS outages", async () => {
  const forgedToken = signedToken().replace(/.$/, (value) => value === "A" ? "B" : "A");
  assert.equal(await authorizeOperator(request(forgedToken), env, retrieve, now), null);
  const missingKey = (async () => new Response(JSON.stringify({ keys: [] }), { status: 200 })) as typeof fetch;
  assert.equal(await authorizeOperator(request(signedToken()), env, missingKey, now), null);
  const outage = (async () => { throw new Error("test certificate endpoint down"); }) as typeof fetch;
  assert.equal(await authorizeOperator(request(signedToken()), env, outage, now), null);
});

test("there is no browser credential, demo authentication, or Avuhz authority shortcut", () => {
  assert.match(auth, /createPublicKey/);
  assert.match(auth, /verifySignature/);
  assert.match(auth, /cdn-cgi\/access\/certs/);
  assert.doesNotMatch(auth, /localStorage|sessionStorage|service_role|process\.env\.NEXT_PUBLIC/);
  assert.doesNotMatch(page, /setState\(|useState\(|onClick=|fetch\([^)]*\/v1\/commands/);
});
