import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const base = new URL("../", import.meta.url);
const page = readFileSync(new URL("app/(prototype)/command-center/page.tsx", base), "utf8");
const css = readFileSync(new URL("app/(prototype)/command-center/operator-visual.css", base), "utf8");
const publicHeader = readFileSync(new URL("components/site-header.tsx", base), "utf8");
const asset = new URL("public/brand/sekinfra-wordmark.webp", base);

test("dashboard uses same existing Sekinfra wordmark asset as public site", () => {
  assert.ok(statSync(asset).size > 1000);
  assert.match(publicHeader, /src="\/brand\/sekinfra-wordmark.webp"/);
  assert.match(page, /import Image from "next\/image"/);
  assert.match(page, /src="\/brand\/sekinfra-wordmark.webp"/);
  assert.match(page, /alt="Sekinfra"/);
  assert.match(page, /aria-label="Sekinfra Command Center home"/);
  assert.match(page, /priority sizes="196px"/);
  assert.doesNotMatch(page, />S\/<\/span>/);
});

test("logo is accessible and retains original colors against dark theme", () => {
  assert.match(page, /operator-logo-plate/);
  assert.match(page, /className="operator-shell/);
  assert.match(css, /\.operator-logo-plate\s*\{/);
  assert.match(css, /background:\s*#fff/);
  assert.match(css, /--operator-deep:\s*#091217/);
  assert.match(css, /--operator-lime:\s*#b9ef70/);
  assert.doesNotMatch(page, /mix-blend-multiply|brightness\(|hue-rotate\(/);
});

test("logo change preserves signed owner authorization and private no-index page", () => {
  const auth = page.indexOf("authorizeOperator(await headers())");
  const denied = page.indexOf("if (!identity) notFound()");
  const read = page.indexOf("await Promise.all([avuhzReadiness()");
  assert.ok(auth > -1 && denied > auth && read > denied);
  assert.match(page, /robots: \{ index: false, follow: false/);
  assert.match(page, /export const dynamic = "force-dynamic"/);
  assert.doesNotMatch(page, /service_role|NEXT_PUBLIC_N8N|SUPABASE_SERVICE/);
});
