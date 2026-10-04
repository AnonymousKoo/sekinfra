import test from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../app/api/diagnostic-intake/route.ts";

test("diagnostic intake status declares real prospect data disabled", async () => {
  const response = await GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, "NOT_CONNECTED");
  assert.equal(body.acceptsRealProspectData, false);
  assert.equal(body.contractVersion, "sekinfra.website-diagnostic-intake.v1");
});

test("diagnostic intake POST fails closed before any adapter exists", async () => {
  const response = await POST();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.error, "INTAKE_NOT_CONNECTED");
  assert.equal(body.acceptsRealProspectData, false);
});
