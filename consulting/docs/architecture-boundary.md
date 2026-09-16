# Sekinfra consulting domain boundary

Sekinfra owns business-architecture consulting and the OIA system: its
methodology, diagnostic and commercial meaning, assessment lifecycle,
evidence model, analysis, findings, recommendations, consulting decisions,
and company-specific policy.

Avuhz owns the reusable governed foundation and reusable cross-domain
systems. Sekinfra may reimplement foundation patterns locally or consume an
explicit public contract, but this package may not import Avuhz private
repositories, handlers, aggregates, persistence, or migrations.

The dependency direction is one-way:

```text
Sekinfra accepted conversion + selected delivered Findings
  -> Sekinfra ImplementationOutcome authority
  -> Sekinfra ImplementationHandoff producer
  -> Avuhz public ImplementationHandoff v1
  -> Avuhz implementation governance
```

Only opaque provider provenance crosses the boundary. OIA assessments,
evidence, observations, root causes, findings, deliveries, methodology,
consulting agreements, and consulting payment/access records remain private
to Sekinfra. An ImplementationHandoff grants no implementation, credential,
production, or deployment authority.


## Current implementation status

`ImplementationOutcome v1` is now implemented as a strict Sekinfra domain/application resource with an in-memory authoritative repository, exact accepted-conversion and selected-Finding binding, dual client/Sekinfra approval, versioned supersession, revocation, secret rejection, and deterministic public handoff production. It creates no implementation or deployment authority.

PostgreSQL persistence/RLS, an API surface, and Avuhz intake remain separate future work. The governed `ImplementationOutcome` create, approval-recording, approve, and revoke operations are now wired through SekInfra’s existing command envelope, guards, idempotency, lifecycle-event, outbox, and `Executor` path.
