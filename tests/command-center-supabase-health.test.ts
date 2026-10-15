import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { probeSupabaseHealth } from "../lib/command-center/supabase-health.ts";

const page=readFileSync(new URL("../app/(prototype)/command-center/page.tsx",import.meta.url),"utf8");
const code=readFileSync(new URL("../lib/command-center/supabase-health.ts",import.meta.url),"utf8");
const PUBLISHABLE="sb_publishable_"+ "x".repeat(24);
const LEGACY_ANON="e30."+Buffer.from(JSON.stringify({role:"anon"})).toString("base64url")+".signature";
const LEGACY_SERVICE="e30."+Buffer.from(JSON.stringify({role:"service_role"})).toString("base64url")+".signature";

test("AUTH and DATA are distinct project hosts and keys",async()=>{
  const urls:string[]=[];
  const mocked:typeof fetch=(async(url:RequestInfo|URL,options?:RequestInit)=>{
    urls.push(String(url));
    assert.equal(options?.method,"GET");
    assert.equal(options?.cache,"no-store");
    assert.equal(options?.redirect,"error");
    assert.equal((options?.headers as Record<string,string>).apikey,PUBLISHABLE);
    assert.doesNotMatch(JSON.stringify(options),/service_role|Bearer/);
    return new Response("{}",{status:200});
  }) as typeof fetch;
  const configuration={SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY:PUBLISHABLE,SEKINFRA_DEV_DATA_PUBLISHABLE_KEY:PUBLISHABLE};
  const [auth,data]=await Promise.all([
    probeSupabaseHealth("AUTH",configuration,mocked),
    probeSupabaseHealth("DATA",configuration,mocked),
  ]);
  assert.deepEqual(urls,[
    "https://pwlhruwutoitnieactol.supabase.co/auth/v1/health",
    "https://gnuqaefotwgkwurjpyik.supabase.co/auth/v1/health",
  ]);
  assert.equal(auth.state,"api_responding");
  assert.equal(data.state,"api_responding");
  assert.equal(auth.tenant_data_connected,false);
  assert.equal(data.tenant_data_connected,false);
  assert.match(auth.detail,/not establish an authorized Avuhz owner session/i);
});

test("missing DATA key does not reuse AUTH key or probe DATA",async()=>{
  let calls=0;
  const probe:typeof fetch=(async()=>{calls++;return new Response("ok",{status:200})}) as typeof fetch;
  const data=await probeSupabaseHealth("DATA",{SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY:PUBLISHABLE},probe);
  assert.equal(data.state,"not_configured");
  assert.match(data.detail,/DEVELOPMENT DATA/);
  assert.equal(calls,0);
});

test("reject elevated service keys without making any request",async()=>{
  const seen:string[]=[];
  const check:typeof fetch=(async(url:RequestInfo|URL)=>{seen.push(String(url));return new Response("ok",{status:200})}) as typeof fetch;
  for(const key of [LEGACY_SERVICE,"sb_secret_"+"x".repeat(30),"service_role","random",""]) {
    const status=await probeSupabaseHealth("AUTH",{SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY:key},check);
    assert.notEqual(status.state,"api_responding");
  }
  assert.deepEqual(seen,[]);
  const accepted=await probeSupabaseHealth("AUTH",{SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY:LEGACY_ANON},check);
  assert.equal(accepted.state,"api_responding");
  assert.equal(seen.length,1);
});

test("unexpected provider statuses and network errors do not appear connected",async()=>{
  const denied:typeof fetch=(async()=>new Response("access denied",{status:403})) as typeof fetch;
  const a=await probeSupabaseHealth("AUTH",{SEKINFRA_DEV_AUTH_PUBLISHABLE_KEY:PUBLISHABLE},denied);
  assert.equal(a.state,"unavailable");
  assert.match(a.detail,/rejected/);
  const failed:typeof fetch=(async()=>{throw new Error("api-key-secret-should-not-appear")}) as typeof fetch;
  const b=await probeSupabaseHealth("DATA",{SEKINFRA_DEV_DATA_PUBLISHABLE_KEY:PUBLISHABLE},failed);
  assert.equal(b.state,"unavailable");
  assert.doesNotMatch(JSON.stringify(b),/api-key-secret-should-not-appear/);
});

test("probes happen only after owner JWT verification; no RLS / service role shortcut",()=>{
  assert.match(page,/probeSupabaseHealth\("AUTH"\)/);
  assert.match(page,/probeSupabaseHealth\("DATA"\)/);
  assert.match(page,/Supabase \/ DEVELOPMENT AUTH/);
  assert.match(page,/Supabase \/ DEVELOPMENT DATA/);
  const owner=page.indexOf("if (!identity) notFound()");
  const call=page.indexOf("probeSupabaseHealth(\"AUTH\")");
  assert.ok(owner>=0 && call>owner);
  assert.match(page,/tenant operations", state:"Not connected"/);
  assert.doesNotMatch(code,/\/rest\/v1\/|\/rpc\/|\bPOST\b|process\.env\.SUPABASE_SERVICE/);
  assert.match(page,/connected:false \},\n\s*\{ label:"Avuhz \/ tenant operations"/);
});
