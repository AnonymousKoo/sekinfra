# Sekinfra consulting and OIA domain

This package owns Sekinfra business-architecture consulting meaning and its OIA lifecycle: diagnostic commercial ingress, assessment access, assessment planning, inspections, evidence, observations, root causes, findings, findings delivery, consulting decisions, and consulting-specific ongoing commercial/access records.

The runtime is self-contained. It does not import Avuhz repositories, command handlers, aggregates, persistence code, or other private implementation modules. Its command/UoW/idempotency/event/outbox patterns are a local implementation supporting the extracted domain.

The only outbound integration is the versioned public `ImplementationHandoff` contract in `contracts/public`. Sekinfra may produce that contract; Avuhz must not consume Sekinfra OIA schemas or runtime.

## Local validation

From this directory:

```bash
PYTHONPATH=src:.:tests/contracts:tests/runtime python3 -m unittest discover -s tests/runtime -p "test_*.py"
for validator in tests/contracts/validate_*.py; do PYTHONPATH=src:.:tests/contracts:tests/runtime python3 "$validator"; done
PYTHONPATH=src python3 -m unittest tests/test_implementation_handoff_producer.py
```

PostgreSQL integration tests require a disposable local DSN. They do not contact remote Supabase and must be reported as skipped when no local DSN is configured.
