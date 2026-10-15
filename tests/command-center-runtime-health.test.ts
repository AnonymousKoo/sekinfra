import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { probeAvuhzDevelopment, probeProductionN8n } from "../lib/command-center/operator-runtime-probes.ts";

const page=readFileSync(new URL("../app/(prototype)/command-center/page.tsx",import.meta.url),"utf8");
const code=readFileSync(new URL("../lib/command-center/operator-runtime-probes.ts",import.meta.url),"utf8");

function mockEndpoint(status:number, text:string) {
  const urls:string[]=[];
  const fetcher:typeof fetch = (async (url:RequestInfo|URL,opts?:RequestInit)=>{
    urls.push(String(url));
    assert.equal(opts?.method,"GET");
    assert.equal(opts?.cache,"no-store");
    assert.equal(opts?.redirect,"error");
    assert.equal(JSON.stringify(opts).includes("Bearer"),false);
    return new Response(text,{status});
  }) as typeof fetch;
  return {fetcher,urls};
}

test("bounded avuhz health classifies unavailable DATA without claiming tenant integration",async()=>{
  const source=mockEndpoint(503,JSON.stringify({status:"not_ready",checks:{configuration:"ready",identity:"ready",data:"unavailable"}}));
  const r=await probeAvuhzDevelopment(source.fetcher);
  assert.equal(r.state,"not_ready");
  assert.equal(r.integration_connected,false);
  assert.match(r.detail,/DATA check unavailable/);
  assert.deepEqual(source.urls,["https://avuhz-command-dev.onrender.com/health/ready"]);
});
test("avuhz ready HTTP is only a health signal, not system command availability",async()=>{
  const r=await probeAvuhzDevelopment(mockEndpoint(200,JSON.stringify({status:"ready",checks:{data:"ready"}})).fetcher);
  assert.equal(r.state,"responding");
  assert.equal(r.integration_connected,false);
  assert.match(r.detail,/not tenant access/);
});
test("Avuhz API malformed, secrets, network failures cannot become healthy",async()=>{
  const candidates=[
    mockEndpoint(200,"untrusted").fetcher,
    mockEndpoint(200,JSON.stringify({status:"untrusted"})).fetcher,
    mockEndpoint(429,"{}").fetcher,
    (async()=>{throw new Error("secret-not-displayed")}) as typeof fetch,
  ];
  for(const fetcher of candidates){const result=await probeAvuhzDevelopment(fetcher);
    assert.equal(result.state,"unavailable");assert.equal(result.integration_connected,false);
    assert.doesNotMatch(JSON.stringify(result),/secret-not-displayed/);
  }
});
test("n8n 502 stays unhealthy while 200 is only HTTP response, no execution telemetry",async()=>{
  const broken=mockEndpoint(502,"<html>gateway error</html>");
  const r=await probeProductionN8n(broken.fetcher);
  assert.equal(r.state,"not_ready");assert.equal(r.integration_connected,false);
  assert.deepEqual(broken.urls,["https://n8n.sekinfra.com/healthz"]);
  assert.match(r.detail,/gateway/);
  const healthy=await probeProductionN8n(mockEndpoint(200,"ok").fetcher);
  assert.equal(healthy.state,"responding");
  assert.equal(healthy.integration_connected,false);
  assert.match(healthy.detail,/NOT connected/);
});
test("page calls health probes only after verified operator guard",()=>{
  assert.match(page,/probeProductionN8n\(\)/);
  assert.match(page,/probeAvuhzDevelopment\(\)/);
  const guard=page.indexOf("if (!identity) notFound()");
  const fetch=page.indexOf("const [avuhz, activity, reviewQueue, n8nProduction, authHealth, dataHealth]");
  assert.ok(guard>=0 && fetch>guard);
  assert.match(page,/connected:false \},\n\s*\{ label:"Avuhz \/ tenant operations"/);
  assert.match(page,/Health failed/);
  assert.match(page,/not authenticated execution feeds/);
  assert.doesNotMatch(code,/OPENAI_API_KEY|SUPABASE_SERVICE|service_role|NEXT_PUBLIC|POST|\/v1\/commands/);
});
