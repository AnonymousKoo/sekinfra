# Phase 5D — Implementation Outcome authority

Status: implemented domain/application core with strict local contract and in-memory authoritative repository

## Purpose

Phase 5D closes the authority gap between an accepted OIA conversion decision and the public `ImplementationHandoff` producer.

The dependency direction is:

```text
accepted OIAConversionDecision
  -> exact selected delivered Finding revisions
  -> ImplementationOutcome DRAFT
  -> exact client approval + exact Sekinfra approval
  -> ImplementationOutcome APPROVED
  -> deterministic public ImplementationHandoff
```

`ImplementationOutcome` is Sekinfra authority over what may be handed to implementation planning. It is not implementation authority, deployment authority, credential authority, production authority, or managed-operations authority.

## Lifecycle

```text
DRAFT -> APPROVED -> SUPERSEDED | REVOKED
```

A material revision is a new `outcome_version`. Version 2 and later require exact predecessor identity, version, and digest for both the prior `ImplementationOutcome` and prior public `ImplementationHandoff`. Approving a valid replacement supersedes the prior approved outcome without rewriting history.

## Source binding

The handler derives source truth from authoritative repositories. Callers cannot submit or widen the selected Finding set.

A draft requires:

- an active Sekinfra engagement;
- the current exact `OIAConversionDecision` in `ACCEPTED` state with decision `PROCEED`;
- the latest exact immutable `OIAFindingsDelivery` bound by identity, sequence, and manifest digest;
- the exact current `FINAL` Finding revisions selected by that conversion; and
- a non-empty selected Finding set.

The same source truth is revalidated when the outcome is approved and whenever a public handoff is built. If a conversion, delivery, or selected Finding is superseded, the stale outcome fails closed.

## Outcome authority digest and approval

The implementation outcome authority digest covers the exact conversion reference, selected Finding references, implementation handoff identity/version, bounded scope, exclusions, constraints, context references, integrations, allowed access level, risks, implementation requirements, acceptance criteria, prohibited changes, dependencies, assumptions/limitations, and the explicit false authority flags.

Approval requires two distinct active `HumanApproval` records over that exact digest:

- `CLIENT_DECISION_AUTHORITY`, exported as `CLIENT_APPROVER`; and
- `SEKINFRA_ENGAGEMENT_AUTHORITY`, exported as `PROVIDER_APPROVER`.

The existing human authority roles are reused. `IMPLEMENTATION_OUTCOME` is a new approval subject/category and a new typed internal reference. Duplicate active approval for the same role, version, and digest is rejected.

## Security boundary

Every outcome requires:

```text
implementation_authority_granted == false
deployment_authority_granted == false
```

Secret-bearing field names and values are rejected before persistence. The public handoff is still provider-neutral and carries only opaque source-artifact references. OIA evidence, observations, root causes, assessor notes, credentials, and private provider payloads do not cross the boundary.

`allowed_access_level` remains limited to the public handoff vocabulary:

- `NO_DIRECT_ACCESS`
- `READ_ONLY`
- `SANDBOX_ONLY`
- `NON_PRODUCTION_BOUNDED`

No outcome or handoff grants production change authority.

## Implemented runtime surface

Implemented now:

- strict `ImplementationOutcome v1` JSON Schema;
- approved schema-registry entry;
- closed capability vocabulary for write, approve, and revoke;
- typed `IMPLEMENTATION_OUTCOME` internal reference;
- `HumanApproval` binding for implementation outcomes;
- `ImplementationOutcomeRepository` port;
- in-memory versioned authoritative repository;
- `ImplementationOutcomeHandler.create_draft`;
- `ImplementationOutcomeHandler.record_approval`;
- `ImplementationOutcomeHandler.approve`;
- `ImplementationOutcomeHandler.revoke`;
- `ImplementationOutcomeHandler.build_handoff`;
- exact source freshness revalidation;
- versioned supersession; and
- deterministic compatibility with public `ImplementationHandoff v1`.

## Not implemented in this slice

This slice deliberately does not add:

- PostgreSQL tables, migrations, or RLS policies;
- generic command-envelope schemas or `Executor` command-registry wiring;
- HTTP/API endpoints;
- browser or client-side write paths;
- n8n workflow authority;
- Avuhz runtime intake or acknowledgment;
- implementation execution authority; or
- deployment authority.

Those remain separate future slices. A database resource is not complete until tenant-scoped RLS is designed and verified. Avuhz must consume only the public handoff contract, never Sekinfra private OIA repositories or analysis records.
