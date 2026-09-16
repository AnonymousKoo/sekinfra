"""PostgreSQL persistence for governed Phase 5D ImplementationOutcome authority."""
from __future__ import annotations

import copy
import json


def _json(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def _record(row):
    if not row:
        return None
    value = row["record"]
    return copy.deepcopy(json.loads(value) if isinstance(value, str) else value)


class ImplementationOutcomePostgresRepository:
    def __init__(self, uow):
        self.uow = uow

    def _one(self, sql, params):
        return self.uow.connection.execute(sql, params).fetchone()

    def get_version(self, tenant_id, outcome_id, outcome_version):
        return _record(self._one(
            "select record from public.sekinfra_implementation_outcomes "
            "where tenant_id=%s and implementation_outcome_id=%s and outcome_version=%s",
            (tenant_id, outcome_id, outcome_version),
        ))

    def get_current(self, tenant_id, outcome_id):
        return _record(self._one(
            "select record from public.sekinfra_implementation_outcomes "
            "where tenant_id=%s and implementation_outcome_id=%s and state<>'SUPERSEDED' "
            "order by outcome_version desc limit 1",
            (tenant_id, outcome_id),
        ))

    def create(self, record):
        if record["outcome_version"] > 1:
            current = self.get_current(record["tenant_id"], record["implementation_outcome_id"])
            if not current or current["outcome_version"] + 1 != record["outcome_version"]:
                raise ValueError("implementation outcome version gap")
        self.uow.failpoint("AUTHORITATIVE_WRITE")
        source = record["source_conversion_reference"]
        cur = self.uow.connection.execute(
            "insert into public.sekinfra_implementation_outcomes "
            "(tenant_id,implementation_outcome_id,outcome_version,implementation_handoff_id,"
            "handoff_version,engagement_id,oia_conversion_decision_id,decision_version,state,"
            "outcome_authority_digest,record_version,record,created_at,updated_at) "
            "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s,%s) "
            "on conflict do nothing returning implementation_outcome_id",
            (record["tenant_id"], record["implementation_outcome_id"], record["outcome_version"],
             record["implementation_handoff_id"], record["handoff_version"], record["engagement_id"],
             source["reference_id"], source["reference_version"], record["state"],
             record["outcome_authority_digest"], record["record_version"], _json(record),
             record["created_at"], record["updated_at"]),
        )
        if not cur.fetchone():
            raise ValueError("implementation outcome identity/version conflict")
        return copy.deepcopy(record)

    def approve(self, current, upstream_approval_references, approved_at):
        updated = copy.deepcopy(current)
        updated.update(
            state="APPROVED",
            upstream_approval_references=copy.deepcopy(upstream_approval_references),
            approved_at=approved_at,
            record_version=current["record_version"] + 1,
            updated_at=approved_at,
        )
        self.uow.failpoint("AUTHORITATIVE_WRITE")
        if current.get("supersedes_outcome_reference"):
            ref = current["supersedes_outcome_reference"]
            prior = self.get_version(current["tenant_id"], ref["reference_id"], ref["reference_version"])
            if (
                not prior
                or prior.get("state") != "APPROVED"
                or prior.get("outcome_authority_digest") != ref.get("reference_digest")
            ):
                raise ValueError("superseded approved implementation outcome is required")
            superseded = copy.deepcopy(prior)
            superseded.update(
                state="SUPERSEDED",
                terminal_at=approved_at,
                terminal_reason="SUPERSEDED_BY_NEW_VERSION",
                record_version=prior["record_version"] + 1,
                updated_at=approved_at,
            )
            cur = self.uow.connection.execute(
                "update public.sekinfra_implementation_outcomes set state='SUPERSEDED',"
                "record_version=%s,record=%s::jsonb,updated_at=%s "
                "where tenant_id=%s and implementation_outcome_id=%s and outcome_version=%s "
                "and state='APPROVED' and record_version=%s",
                (superseded["record_version"], _json(superseded), approved_at,
                 prior["tenant_id"], prior["implementation_outcome_id"],
                 prior["outcome_version"], prior["record_version"]),
            )
            if cur.rowcount != 1:
                raise ValueError("implementation outcome supersession concurrency conflict")
        cur = self.uow.connection.execute(
            "update public.sekinfra_implementation_outcomes set state='APPROVED',"
            "record_version=%s,record=%s::jsonb,updated_at=%s "
            "where tenant_id=%s and implementation_outcome_id=%s and outcome_version=%s "
            "and state='DRAFT' and record_version=%s",
            (updated["record_version"], _json(updated), approved_at, current["tenant_id"],
             current["implementation_outcome_id"], current["outcome_version"],
             current["record_version"]),
        )
        if cur.rowcount != 1:
            raise ValueError("implementation outcome approval concurrency conflict")
        return updated

    def revoke(self, current, reason, revoked_at):
        updated = copy.deepcopy(current)
        updated.update(
            state="REVOKED",
            terminal_at=revoked_at,
            terminal_reason=reason,
            record_version=current["record_version"] + 1,
            updated_at=revoked_at,
        )
        self.uow.failpoint("AUTHORITATIVE_WRITE")
        cur = self.uow.connection.execute(
            "update public.sekinfra_implementation_outcomes set state='REVOKED',"
            "record_version=%s,record=%s::jsonb,updated_at=%s "
            "where tenant_id=%s and implementation_outcome_id=%s and outcome_version=%s "
            "and state='APPROVED' and record_version=%s",
            (updated["record_version"], _json(updated), revoked_at, current["tenant_id"],
             current["implementation_outcome_id"], current["outcome_version"],
             current["record_version"]),
        )
        if cur.rowcount != 1:
            raise ValueError("implementation outcome revocation concurrency conflict")
        return updated
