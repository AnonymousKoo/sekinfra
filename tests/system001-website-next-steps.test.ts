import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GET, POST } from "../app/api/diagnostic-intake/route.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

test("next steps keep Sekinfra's OIA separate from reusable Avuhz System #001", () => {
  const page = read("app/start/page.tsx");
  assert.match(page, /the OIA is Sekinfra's separate consulting diagnostic method/);
  assert.match(page, /System #001 is our reusable model for intake, handoffs, blocked work, and resolution/);
  assert.match(page, /website integration is approved and activated/);
  assert.match(page, /not a live status tracker/);
  assert.match(page, /id="after-request"/);
  for (const title of [
    "You send the request", "Sekinfra reviews it", "We agree on the next step",
    "Work moves with clear ownership",
  ]) assert.ok(page.includes(title));
});

test("prepared website request remains manual with truthful delivery state", () => {
  const component = read("components/diagnostic-intake.tsx");
  assert.match(component, /Your request has not yet reached Sekinfra/);
  assert.match(component, /No work item has been opened automatically/);
  assert.match(component, /href="#after-request"/);
  assert.match(component, /This website does not send or save your details/);
  assert.match(component, /href="mailto:admin@sekinfra\.com"/);
  assert.doesNotMatch(component, /(?:fetch|navigator\.sendBeacon)\s*\(/);
});

test("public API still fails closed until a separately authorized server-side connection", async () => {
  const get = await GET();
  const getBody = await get.json();
  assert.equal(getBody.status, "NOT_CONNECTED");
  assert.equal(getBody.acceptsRealProspectData, false);
  const post = await POST();
  const postBody = await post.json();
  assert.equal(post.status, 503);
  assert.equal(postBody.error, "INTAKE_NOT_CONNECTED");
  assert.equal(postBody.acceptsRealProspectData, false);
});
