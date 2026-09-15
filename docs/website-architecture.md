# Sekinfra website architecture

## Brand and purpose

This repository (`sekinfra`) is the public website for **Sekinfra** at `https://www.sekinfra.com`. The website is an inbound sales experience: it helps an owner or operator recognize operational friction, understand Sekinfra's diagnostic-led work, assess relevance, and begin a diagnostic.

Sekinfra is the client-facing company. Avuhz is proprietary operating infrastructure used by Sekinfra to govern diagnostics, scope, authority, implementation, and change; it is not a public SaaS product or primary website brand.

## Positioning and visitor journey

Primary positioning: **Business infrastructure built around how your operation actually works.** Sekinfra identifies where operations leak time, money, visibility, or accountability, then designs and builds systems to fix it.

The journey is: problem recognition → relevance → assessment understanding → tangible outcome → trust → controlled next step → start diagnostic. The homepage follows that narrative through the hero, operational signals, contextual selector, Operational Infrastructure Assessment introduction, client deliverables, illustrative evidence path, technology decision, authority boundaries, outcome areas, implementation decision, and final diagnostic CTA.

## Routes and CTA architecture

- `/` — complete sales narrative and interactive selector
- `/outcomes` — outcome examples, explicitly not fixed packages
- `/how-it-works` — Diagnose → Design → Build → Validate → Improve
- `/about` — company philosophy and delivery orientation
- `/start` — diagnostic-entry interface; intentionally non-submitting in Phase 1

“Start a Diagnostic” is the primary CTA throughout. It frames the first step as understanding what is happening before prescribing a build. No contact form implies successful submission before a governed intake exists.

## Dynamic-site direction

The homepage selector changes contextual content locally for Leads, Operations, Accountability, Visibility, and Customer follow-up. It stores no visitor identity, scores no lead, makes no backend call, and seeds future adaptive experience work.

## Design system direction

CSS variables in `app/globals.css` define color hierarchy, surfaces, borders, radii, page width, and typography foundations. Components establish navigation, footer, section headings, and button treatment. The style is restrained: clean geometry, structured cards, useful whitespace, and operational/system motifs rather than generic AI imagery.

## Analytics

`lib/analytics.ts` defines typed internal events: `homepage_primary_cta_clicked`, `homepage_secondary_cta_clicked`, `problem_selected`, `outcome_explored`, and `diagnostic_started`. The Phase 1 function intentionally makes no external request. A later governed vendor adapter can attach behind this boundary.

## Avuhz integration boundary

This public repository must not connect directly to Avuhz Postgres, import Avuhz runtime modules, use service-role credentials, modify Avuhz state, or call internal endpoints that do not exist. Future flow: `sekinfra.com → bounded acquisition/API layer → governed Avuhz handoff`. Design and approval for that handoff precede implementation.

## Roadmap

1. **Phase 1:** foundation and sales narrative.
2. **Phase 2:** premium visual and interaction elevation.
3. **Phase 3:** dynamic visitor personalization.
4. **Phase 4:** inbound qualification and acquisition integration.
5. **Phase 5:** analytics, experimentation, SEO/performance, and production hardening.

Deployment, DNS, hosting, and production integrations are explicitly outside Phase 1.

## Phase 2 visual architecture

Phase 2 establishes a distinctive Sekinfra visual language: restrained neutral surfaces, deep evergreen control planes, a single lime signal accent, architectural grids, status points, and routed nodes. The reusable `SystemDiagram` component supports hero, diagnostic-selector, and delivery-control contexts so the system motif persists without identical repetition.

Motion is functional and quiet: signals travel along a process path, nodes enter in sequence, and interactive tabs reveal the relevant state. All nonessential motion is reduced when `prefers-reduced-motion` is enabled. Responsive art direction reduces diagram complexity and node scale on small screens; semantic content remains available without the diagram.

The selector now coordinates signal, consequence, desired outcome, microcopy, and a system path. `ProcessFlow` provides a responsive horizontal-to-grid process exploration model, with keyboard-operable tabs. The mobile navigation is a focused, escape-closeable client island and locks background scroll while open.

Visual performance remains CSS/SVG/HTML-led: no animation library, video, raster dependency, WebGL, or external visual service was introduced. Client boundaries are limited to navigation and interaction components. The temporary icon and Next-generated Open Graph image are Sekinfra-specific and replaceable when final identity assets exist.

## Phase 3 contextual personalization

Phase 3 provides explicit, local, reversible, non-identifying contextual personalization. The site adapts only after a visitor chooses one closed operational focus: `leads`, `operations`, `accountability`, `visibility`, or `customer-follow-up`.

### Data flow

`Problem selector → PersonalizationProvider → sessionStorage (current browser session only) → typed profile registry → contextual client islands (hero, diagram, outcomes, process, route introductions, diagnostic preview)`.

`sessionStorage` contains only one validated vocabulary value. It is read after hydration, ignored if malformed or unavailable, and removed by **Reset focus**. No cookies, localStorage, identifiers, cross-session profiles, fingerprinting, behavioral scoring, third-party tracking, server storage, or network calls are involved.

The registry in `lib/personalization.ts` is the single source of truth for profile recognition, consequence, desired outcome, system response, contextual hero/CTA language, system flow, signal prioritization, process examples, outcome ordering, and diagnostic-preview questions. Neutral rendering remains the server-safe fallback whenever no valid selection is present.

Route behavior: the homepage adapts its supporting hero narrative, system path, signal hierarchy, selector state, outcome ordering, process examples, and final CTA support; `/outcomes` and `/how-it-works` add clear contextual introductions; `/about` stays philosophy-first with only a subtle CTA; `/start` carries the selected focus into an illustrative, non-submitting diagnostic preview.

The typed analytics boundary adds local no-op event vocabulary for personalization start/change/reset and contextual exploration. No event leaves the browser. The website itself is the adaptive inbound sales experience; a separate Martes chatbot is not part of the architecture, and no conversational AI or LLM call is used.

The Avuhz boundary is unchanged: `sekinfra.com → future bounded acquisition layer → governed Avuhz handoff`. Phase 3 creates no acquisition record, engagement, scope, authority state, or Avuhz connection. Website Phase 4—actual intake, qualification, booking where appropriate, bounded server integration, and consent for submitted data—is explicitly not implemented. Website Phase 5 remains production analytics, experiments, SEO/performance, hardening, and deployment refinement.

## Landing Page UX 1

Landing Page UX 1 extends the homepage sales narrative without adding an intake backend or application infrastructure. The sequence now moves from operational recognition and contextual relevance into a plain language introduction to the Operational Infrastructure Assessment, the client deliverables, an illustrative evidence path, controlled authority, outcomes, and the separately authorized implementation decision.

The new static homepage sections live in `components/landing/oia-story.tsx`. They remain React Server Components and use the existing CSS, HTML, and SVG led visual system. The only browser state remains the existing session scoped operational focus.

The public authority promise is explicit:

- assessment scope is agreed before inspection;
- diagnostic access is limited and temporary;
- assessment access does not authorize system changes;
- findings delivery does not authorize implementation;
- implementation, deployment, and ongoing access remain separate decisions.

## OIA Workspace UX 1

Two directly addressable, non-production prototype routes demonstrate one synthetic OIA engagement from operator and client perspectives: `/workspace/engagements/demo` and `/client/engagements/demo`. Both are server rendered from one fixture and explicitly identify themselves as synthetic demonstrations.

The operator projection includes plan detail, inspection coverage, provenance summaries, internal observations, root cause confidence, draft and final findings, and delivery readiness. The client projection is intentionally narrower: approved scope, access boundaries, high level progress, final delivered findings, immutable delivery history, and explanatory next phase options. It excludes internal observations, hypotheses, draft findings, secure evidence references, assessor notes, and raw audit metadata.

These routes provide no authentication, API, persistence, client action, authority facade, database access, or Avuhz integration. The detailed demo still uses presentation stage labels, while exact assessment technical facts can now be represented by `OIAEngagementProgressView v1`.


## OIA Workspace UX 2

OIA Workspace UX 2 adds two synthetic operator routes: `/workspace` for the attention overview and `/workspace/engagements` for the engagement index. Along with `/workspace/engagements/demo`, these operator routes render only in local development and Vercel preview. Every operator entry route calls the shared production prototype guard and returns a 404 when `VERCEL_ENV` is `production`. The existing client demonstration remains at `/client/engagements/demo`.

The workspace fixture uses a fixed synthetic reference time and deterministic presentation queues. Queue membership and attention ownership remain nonauthoritative presentation projections. Exact assessment technical facts may now come from `OIAEngagementProgressView v1`; pre assessment portfolio state still remains synthetic because the domain does not define a safe current Scope, access Grant, or assessment selection rule for an arbitrary engagement.

The workspace remains server rendered and read only. It adds no authentication, persistence, API, database access, client action, production connection, or Avuhz integration.
## OIA Workspace Read Model 1

This slice connects the operator prototype to the public `OIAEngagementProgressView v1` contract without inventing a live transport. Northline Field Services uses a checked-in synthetic snapshot that is validated against the consulting JSON Schema. Its Scope state, assessment state, assessment-access usability, inspection coverage, Finding counts, delivery sequence, and bounded next required action are projected from that contract shape.

The snapshot is not production data and is never described as authoritative stored state. Organization labels, lifecycle display labels, and attention ownership remain presentation data. Other pre assessment portfolio entries remain synthetic until the domain defines an unambiguous current-resource invariant.

The operator workspace contains no browser database access, API adapter, Python subprocess, authentication, Supabase connection, or Avuhz runtime call. The production route guard remains unchanged. `OIAEngagementProgressView v1` explicitly keeps implementation and deployment authority false, and the frontend adapter fails closed if either value is true.
