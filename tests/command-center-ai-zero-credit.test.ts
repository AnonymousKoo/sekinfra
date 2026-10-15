import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const view=readFileSync(new URL("../components/command-center/ai-operator.tsx", import.meta.url),"utf8");
const page=readFileSync(new URL("../app/(prototype)/command-center/page.tsx", import.meta.url),"utf8");
const route=readFileSync(new URL("../app/api/operator/ai-chat/route.ts", import.meta.url),"utf8");

test("the private operator shows key missing, key staged, and API unverified distinctly",()=>{
  assert.match(view,/Awaiting secure API key/);
  assert.match(view,/Key configured · requests paused/);
  assert.match(view,/Read-only API enabled · not yet verified/);
  assert.match(view,/OpenAI account · connection setup/);
  assert.match(view,/Leave the AI feature disabled while your credit is \$0/);
  assert.match(view,/credentialConfigured: boolean/);
  assert.match(page,/credentialConfigured=\{!!process\.env\.OPENAI_API_KEY\}/);
});

test("client never gains credentials or enables calls while disabled",()=>{
  assert.match(view,/if \(!available \|\| busy \|\| !question/);
  assert.match(view,/disabled=\{!available \|\| busy\}/);
  assert.match(view,/disabled=\{!available \|\| busy \|\| !draft.trim\(\)\}/);
  assert.doesNotMatch(view,/process\.env|OPENAI_API_KEY|localStorage|sessionStorage|dangerouslySetInnerHTML|service_role/);
  assert.match(view,/Never paste a key here/);
});

test("signed owner auth and server-side feature flag must precede any OpenAI request",()=>{
  assert.match(route,/request.nextUrl.hostname !== "dashboard.sekinfra.com"/);
  assert.match(route,/SEKINFRA_DEPLOYMENT_ROLE !== "private-operator"/);
  assert.match(route,/authorizeOperator\(request.headers\)/);
  const verified=route.indexOf("if (!identity) return respond(404");
  const gated=route.indexOf('SEKINFRA_AI_OPERATOR_ENABLED !== "true"');
  const request=route.indexOf("requestReadOnlyAiAnswer(messages, context, key)");
  assert.ok(verified>0 && gated>verified && request>gated);
  assert.match(route,/if \(process.env.SEKINFRA_AI_OPERATOR_ENABLED !== "true" \|\| !key\)/);
  assert.doesNotMatch(route,/NEXT_PUBLIC_OPENAI|SUPABASE_SERVICE|n8n.*activate/);
});
