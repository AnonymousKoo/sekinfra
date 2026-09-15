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
Sekinfra approved consulting outcome
  -> Sekinfra ImplementationHandoff producer
  -> Avuhz public ImplementationHandoff v1
  -> Avuhz implementation governance
```

Only opaque provider provenance crosses the boundary. OIA assessments,
evidence, observations, root causes, findings, deliveries, methodology,
consulting agreements, and consulting payment/access records remain private
to Sekinfra. An ImplementationHandoff grants no implementation, credential,
production, or deployment authority.
