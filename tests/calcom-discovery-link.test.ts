import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateCalcomDiscoveryLink,
  readCalcomDiscoveryLink,
} from "../lib/server/calcom-discovery-link.ts";

const root = new URL("../", import.meta.url);
const read = (name: string) => readFileSync(new URL(name, root), "utf8");

test("only exact public Cal.com HTTPS booking event URLs qualify", () => {
  assert.equal(
    validateCalcomDiscoveryLink("https://cal.com/example/discovery"),
    "https://cal.com/example/discovery",
  );
  assert.equal(
    validateCalcomDiscoveryLink("https://www.cal.com/team/example/discovery"),
    "https://www.cal.com/team/example/discovery",
  );
});

test("fail closed on absent or unapproved scheduling links", () => {
  for (const value of [
    undefined, null, "", 1, "cal.com/example/discovery",
    "http://cal.com/example/discovery",
    "https://cal.com.evil.example/user/event",
    "https://evil.example/cal.com/user/event",
    "https://app.cal.com/user/event",
    "https://cal.com/", "https://cal.com/user",
    "https://cal.com/user/event/another",
    "https://cal.com/team/user", "https://cal.com//user/event",
    "https://cal.com/user/event/", "https://cal.com/user/event?email=someone@example.com",
    "https://cal.com/user/event#secret",
    "https://cal.com/user/event?", "https://cal.com/user/event#",
    "https://cal.com/user/e\nvent", "https://cal.com/user/e\tvent",
    "https://name:password@cal.com/user/event",
    "https://cal.com:444/user/event", " https://cal.com/user/event ",
    "https://cal.com/user/%2F", "https://cal.com/user/../event",
    "https://cal.com/user/event\\other",
  ]) {
    assert.equal(validateCalcomDiscoveryLink(value), null, String(value));
  }
});

test("server environment is inactive by default and invalid config remains hidden", () => {
  const previous = process.env.SEKINFRA_CALCOM_DISCOVERY_URL;
  try {
    delete process.env.SEKINFRA_CALCOM_DISCOVERY_URL;
    assert.equal(readCalcomDiscoveryLink(), null);
    process.env.SEKINFRA_CALCOM_DISCOVERY_URL = "https://malicious.example/event";
    assert.equal(readCalcomDiscoveryLink(), null);
  } finally {
    if (previous === undefined) delete process.env.SEKINFRA_CALCOM_DISCOVERY_URL;
    else process.env.SEKINFRA_CALCOM_DISCOVERY_URL = previous;
  }
});

test("site presents booking as separate from Avuhz and public intake stays closed", () => {
  const page = read("app/start/page.tsx");
  const api = read("app/api/diagnostic-intake/route.ts");
  assert.match(page, /calcomDiscoveryLink \? \(/);
  assert.match(page, /Book a discovery conversation on Cal\.com/);
  assert.match(page, /bookings there do not yet/);
  assert.match(page, /create Avuhz System #001 work items/);
  assert.match(page, /referrerPolicy="no-referrer"/);
  assert.match(api, /INTAKE_NOT_CONNECTED/);
  assert.doesNotMatch(page, /(?:fetch|navigator\.sendBeacon)\s*\(/);
});
