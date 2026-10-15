# Cal.com Sekinfra discovery entry — gated website configuration

**State:** Source-only capability. No Cal.com account was accessed, event created,
credential issued, webhook subscribed, real booking or Avuhz work item opened.

## Boundaries

- **Website:** Sekinfra public `/start` may show an OPTIONAL outbound Cal.com
  discovery link only after an approved public event URL is configured.
- **Calendar:** Cal.com owns slot availability, conflict detection, confirmations,
  reschedules and cancellations once its genuine booking event is active.
- **Avuhz:** System #001 owns future authorized lead/work commands, tenant scoping,
  ownership, event/outbox and follow-up obligations. Cal.com booking events are
  **not** automatically authoritative Avuhz Work Items.
- **OIA:** belongs exclusively to Sekinfra consulting. It is not a booking
  prerequisite and is not a general Avuhz system template.

## Operator setup in Cal.com (requires an account holder)

1. On hosted `https://cal.com`, create or sign into an authorized Sekinfra
   scheduling account. Do not give ChatGPT your password or API key.
2. Connect the correct business calendar, verify the time zone and working hours,
   and prevent overlaps. Configure one approved event type, suggested:
   **Discovery Conversation (30 minutes)**, 24-hour advance booking,
   an appropriate between-meeting buffer, and a practical booking horizon.
   Confirm the event's real duration/settings on Cal.com; none is asserted by
   this repository.
3. Set the meeting location and confirm what invitee data is collected. Avoid
   requesting passwords, customer records, sensitive infrastructure details or
   unnecessary PII in Cal.com booking questions.
4. Test a synthetic booking and cancellation within Cal.com. Check actual
   confirmation email and calendar synchronization with non-customer data.
5. Share only the public event link `https://cal.com/<account>/<event>`
   (or a Cal.com team event link) for independent approval. Do not send an
   API token, webhook secret or booking UID.

## Website source gate

`SEKINFRA_CALCOM_DISCOVERY_URL` is an **optional server-render/build-time
public URL**, not an API credential. The website validates that it is an HTTPS
Cal.com event URL, with a limited path and no query, fragment, embedded
credentials or arbitrary domain; invalid or absent values hide the CTA.

Configuration is per specifically confirmed Sekinfra Vercel website environment.
For a static production build, changing this setting may require a new
environment-scoped deployment. Do not set it on the unrelated Command Center,
enable a Vercel production deployment, or merge a main branch change without
explicit scope confirmation. Never commit a real secret, use NEXT_PUBLIC_ keys
for credentials, or add an unreviewed iframe/script.

The existing browser-only Prepare my request and disabled
`/api/diagnostic-intake` endpoint remain unchanged. The link opens Cal.com
as a **separate** booking provider; no automatic lead capture or Avuhz receipt
is claimed.

## Separate shared backend adapter approval

Build the Avuhz Cal.com API v2/webhook adapter ONLY after a real authorized
account and event exist. Require server-side scoped credentials in Vault,
verified webhook signatures per current Cal.com specification, exact
tenant/event-resource mapping, event deduplication, safe replay and revision
handling, minimal PII, authoritative Work Item commands and transactional
outbox handoff. Never trust a browser-provided tenant or booking UID as
authentication; booking UIDs can be bearer-like secrets. No external provider
event or payment may create a tenant or override the shared core's authority.

**Next action:** Obtain the public Cal.com event URL and independently approve
the exact Sekinfra WEBSITE preview configuration. Production and Avuhz hosted
integration require separate explicit approvals.
