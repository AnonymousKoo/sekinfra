import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/(prototype)/command-center/page.tsx", import.meta.url), "utf8");
const component = readFileSync(new URL("../components/command-center/command-center-experience.tsx", import.meta.url), "utf8");

test("command-center route is blocked in production and unknown hosted environments", () => {
  assert.match(page, /isPrototypeRouteBlocked\(process\.env\.VERCEL_ENV\)/);
  assert.match(page, /process\.env\.VERCEL_ENV !== "preview"/);
  assert.match(page, /process\.env\.NODE_ENV !== "development"/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /dynamic = "force-dynamic"/);
  assert.match(page, /index: false, follow: false/);
});

test("command-center only consumes existing synthetic OIA workspace summaries", () => {
  assert.match(page, /orderedWorkspaceEngagements/);
  assert.match(page, /oiaWorkspaceFixture/);
  assert.match(page, /presentationAttentionOwner/);
  assert.doesNotMatch(page, /fetch\s*\(|service_role|createClient|supabase\.from|new Pool\s*\(/);
});

test("new Sekinfra command center UI distinguishes demo actions and disconnected systems", () => {
  for (const section of ["overview", "clients", "systems", "automation", "security"]) {
    assert.match(component, new RegExp('"'+section+'"'));
  }
  assert.match(component, /All client records are fictional/);
  assert.match(component, /No live health checks/);
  assert.match(component, /AI command integration — not connected/);
  assert.match(component, /No input is sent to a server or external model/);
  assert.match(component, /no AI model or action service is connected/i);
  assert.doesNotMatch(component, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|dangerouslySetInnerHTML|eval\s*\(/);
});

test("all proposed systems remain Sekinfra-specific presentation, not Avuhz authority", () => {
  assert.match(component, /n8n\.sekinfra\.com/);
  assert.match(component, /grafana\.sekinfra\.com/);
  assert.match(component, /prometheus\.sekinfra\.com/);
  assert.match(component, /Cloudflare Access/);
  assert.match(component, /No Avuhz authority/);
  assert.doesNotMatch(component, /process\.env\.|service_role|SUPABASE_SERVICE|Authorization:\s*Bearer/);
});
