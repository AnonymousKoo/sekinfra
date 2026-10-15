import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const base = new URL("../", import.meta.url);
const page = readFileSync(new URL("app/(prototype)/command-center/page.tsx", base), "utf8");
const css = readFileSync(new URL("app/(prototype)/command-center/operator-visual.css", base), "utf8");
const avuhzBrand = readFileSync(new URL("components/command-center/avuhz-brand.tsx", base), "utf8");
const publicHeader = readFileSync(new URL("components/site-header.tsx", base), "utf8");
const publicAsset = new URL("public/brand/sekinfra-wordmark.webp", base);
const operatorPrompt = readFileSync(new URL("lib/command-center/ai-operator.ts", base), "utf8");

test("Avuhz owns the private dashboard; the public SekInfra client brand remains intact", () => {
  assert.match(page, /title: "Avuhz Command Center \| AI Operator"/);
  assert.match(page, /<AvuhzBrand \/>/);
  assert.match(page, /aria-label="Avuhz Command Center home"/);
  assert.doesNotMatch(page, /Sekinfra Command Center|Sekinfra <span|sekinfra-wordmark\.webp/);
  assert.ok(statSync(publicAsset).size > 1000);
  assert.match(publicHeader, /src="\/brand\/sekinfra-wordmark.webp"/);
});

test("Avuhz inline logo is accessible, self-contained, and dark (no old white plate)", () => {
  assert.match(avuhzBrand, /aria-label="Avuhz Command Center"/);
  assert.match(avuhzBrand, /<svg viewBox="0 0 56 56"/);
  assert.match(avuhzBrand, />Avuhz<\/span>/);
  assert.match(css, /\.avuhz-symbol\s*\{/);
  assert.match(css, /--operator-deep:\s*#091217/);
  assert.match(css, /--operator-lime:\s*#b9ef70/);
  assert.doesNotMatch(css, /\.operator-logo-plate/);
  assert.match(page, /icons: \{ icon: avuhzFavicon, shortcut: avuhzFavicon \}/);
  assert.match(page, /robots: \{ index: false, follow: false/);
  assert.match(operatorPrompt, /You are Avuhz AI Operator/);
  assert.match(operatorPrompt, /SekInfra is only a client organization/);
});

test("visual rebrand does not weaken signed owner gate or change production host", () => {
  const auth = page.indexOf("authorizeOperator(await headers())");
  const denied = page.indexOf("if (!identity) notFound()");
  const read = page.indexOf("await Promise.all([avuhzReadiness()");
  assert.ok(auth > -1 && denied > auth && read > denied);
  assert.match(page, /SEKINFRA_AI_OPERATOR_ENABLED/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.doesNotMatch(page, /service_role|NEXT_PUBLIC_N8N|SUPABASE_SERVICE/);
});
