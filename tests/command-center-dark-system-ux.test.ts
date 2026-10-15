import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const path = new URL("../app/(prototype)/command-center/page.tsx", import.meta.url);
const cssPath = new URL("../app/(prototype)/command-center/operator-visual.css", import.meta.url);
const page = readFileSync(path, "utf8");
const css = readFileSync(cssPath, "utf8");
const security = readFileSync(new URL("../lib/command-center/operator-access.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../lib/command-center/operator-route-policy.ts", import.meta.url), "utf8");

test("operator brand UI uses scoped dark Sekinfra visual language, never alters public styles", () => {
  assert.match(page, /import "\.\/operator-visual\.css"/);
  assert.match(page, /operator-shell/);
  assert.match(page, /operator-hero/);
  assert.match(page, /operator-eyebrow/);
  assert.match(page, /operator-rail/);
  assert.match(css, /--operator-lime:\s*#b9ef70/);
  assert.match(css, /--operator-teal:\s*#0f9f98/);
  assert.match(css, /#091217/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /(^|\})\s*(?:body|html|:root|\*)\s*\{/);
});

test("all five system outcomes are visible with explicit unverified runtime state", () => {
  for (const id of ["001", "002", "003", "004", "005"]) {
    assert.match(page, new RegExp('id:"'+id+'"'));
  }
  for (const name of ["Revenue Engine", "Booking Engine", "Client Onboarding", "Work & Operations", "Customer Retention"]) {
    assert.ok(page.includes(name), name);
  }
  assert.match(page, /Source tracked · runtime unverified/);
  assert.match(page, /Template readiness unverified/);
  assert.match(page, /No template is installed or activated from this page/);
  assert.match(page, /Avuhz.*n8n is never an alternate policy engine/);
  assert.match(page, /avuhz-infra\/pull\/690/);
});

test("local and production integration matrix cannot misrepresent provider connections", () => {
  assert.match(page, /n8n \/ local", state:"Not connected"/);
  assert.match(page, /n8n \/ production", state:n8nProduction.state/);
  assert.match(page, /"Health failed"/);
  assert.match(page, /connected:false/);
  assert.match(page, /Avuhz \/ tenant operations", state:"Not connected"/);
  assert.match(page, /GitHub \/ engineering activity/);
  assert.match(page, /data-connected=\{source.connected\}/);
  assert.match(page, /Avuhz \/ runtime", state:readinessLabels\[avuhz.status\].*connected:false/);
  assert.match(page, /No public tunnel, credentials or direct browser request is configured/);
  assert.doesNotMatch(page, /localhost:5678|127\.0\.0\.1:5678|NEXT_PUBLIC_N8N|service_role|Bearer [A-Za-z]/);
});

test("private Cloudflare owner gate remains before any server fetch or system rendering", () => {
  const auth = page.indexOf("authorizeOperator(await headers())");
  const denied = page.indexOf("if (!identity) notFound()");
  const read = page.indexOf("await Promise.all([avuhzReadiness()");
  assert.ok(auth >= 0 && denied > auth && read > denied);
  assert.match(security, /verifySignature/);
  assert.match(security, /cf-access-jwt-assertion/);
  assert.match(route, /PRIVATE_OPERATOR_HOST = "dashboard\.sekinfra\.com"/);
  assert.match(page, /robots: \{ index: false, follow: false/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.doesNotMatch(page, /fetch\("http:\/\/|insert into|process\.env\.SUPABASE|executeWorkflow/);
});
