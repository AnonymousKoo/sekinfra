from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from sekinfra_consulting.guards import GuardPipeline, TrustedExecutionContext
from sekinfra_consulting.in_memory import Executor, UnitOfWork
from sekinfra_consulting.schema_registry import SchemaRegistry
from sekinfra_consulting.validation import CommandValidator
from tests.runtime.test_implementation_outcome import ImplementationOutcomeTests

ROOT = Path(__file__).resolve().parents[2]

COMMANDS = {
    "CreateImplementationOutcome": ("create-implementation-outcome", "implementation_outcome:write"),
    "RecordImplementationOutcomeApproval": ("record-implementation-outcome-approval", "implementation_outcome:approve"),
    "ApproveImplementationOutcome": ("approve-implementation-outcome", "implementation_outcome:approve"),
    "RevokeImplementationOutcome": ("revoke-implementation-outcome", "implementation_outcome:revoke"),
}


class ImplementationOutcomeCommandTests(unittest.TestCase):
    def setUp(self):
        base = ImplementationOutcomeTests()
        base.setUp()
        self.base = base
        self.store = base.store
        ids = iter(f"d1000000-0000-4000-8000-{value:012d}" for value in range(1, 500))
        self.executor = Executor(
            CommandValidator(ROOT / "contracts/schemas/v1"),
            GuardPipeline(),
            self.store,
            clock=lambda: self.base.now,
            ids=lambda: next(ids),
        )
        self.event_schema = Draft202012Validator(
            SchemaRegistry(ROOT / "contracts/schemas/v1").expanded(
                "urn:sekinfra:schema:contracts:orchestration:lifecycle-event:v1"
            ),
            format_checker=FormatChecker(),
        )
        self.sequence = 0

    def next_id(self):
        self.sequence += 1
        return f"d2000000-0000-4000-8000-{self.sequence:012d}"

    def context(self, capability, *, caller="INTERNAL_SERVICE", role=None, tenant=None):
        human = caller == "HUMAN"
        principal = f"human:{role.lower()}" if human and role else "service:implementation-outcome"
        return TrustedExecutionContext(
            True,
            principal,
            caller,
            tenant or self.base.tenant,
            "organization.sekinfra" if caller == "HUMAN" else None,
            frozenset({capability}),
            frozenset({role} if role else set()),
            "TEST",
            "sekinfra-consulting-api",
            "STEP_UP",
            True,
            self.base.now,
            "2030-01-15T16:00:00Z",
            principal if human else None,
            "organization.client" if role == "CLIENT_DECISION_AUTHORITY" else "organization.sekinfra" if human else None,
            role,
        )

    def raw(self, command, payload, *, expected=None, caller="INTERNAL_SERVICE", key=None, command_id=None):
        schema, capability = COMMANDS[command]
        command_id = command_id or self.next_id()
        value = {
            "command_id": command_id,
            "command_type": command,
            "command_schema_version": 1,
            "tenant_id": self.base.tenant,
            "engagement_id": self.base.engagement,
            "subject_type": "IMPLEMENTATION_OUTCOME",
            "subject_id": self.base.outcome,
            "requested_by": "trusted.implementation-outcome",
            "caller_type": caller,
            "caller_identity": {
                "subject": "trusted.implementation-outcome",
                "audience": "sekinfra-consulting-api",
                "caller_type": caller,
                "tenant_ids": [self.base.tenant],
                "capabilities": [capability],
                "environment": "TEST",
                "authentication_strength": "STEP_UP",
                "step_up_performed": True,
                "authenticated_at": self.base.now,
                "expires_at": "2030-01-15T16:00:00Z",
            },
            "correlation_id": "d3000000-0000-4000-8000-000000000001",
            "idempotency_key": key or f"implementation-outcome-{command.lower()}-{command_id[-4:]}",
            "requested_at": self.base.now,
            "environment": "TEST",
            "payload_schema": f"urn:sekinfra:schema:contracts:commands:{schema}-payload:v1",
            "payload_version": 1,
            "payload": copy.deepcopy(payload),
        }
        if expected is not None:
            value["expected_record_version"] = expected
        return value

    def execute(self, command, payload, *, expected=None, caller="INTERNAL_SERVICE", role=None, key=None, command_id=None, tenant=None):
        raw = self.raw(command, payload, expected=expected, caller=caller, key=key, command_id=command_id)
        context = self.context(COMMANDS[command][1], caller=caller, role=role, tenant=tenant)
        return raw, self.executor.execute(raw, context)

    def create(self):
        raw, result = self.execute("CreateImplementationOutcome", self.base.payload())
        self.assertEqual(result["result"], "ACCEPTED", result)
        return raw

    def approval_payload(self, role):
        return {
            "implementation_outcome_id": self.base.outcome,
            "outcome_version": 1,
            "authority_role": role,
            "evidence_reference": {
                "source_system": "fictional-approval",
                "object_type": "SOURCE_RECORD",
                "external_id": f"approval.{role.lower()}",
                "environment": "TEST",
            },
        }

    def approve_both(self):
        for role in ("CLIENT_DECISION_AUTHORITY", "SEKINFRA_ENGAGEMENT_AUTHORITY"):
            _, result = self.execute(
                "RecordImplementationOutcomeApproval",
                self.approval_payload(role),
                expected=1,
                caller="HUMAN",
                role=role,
            )
            self.assertEqual(result["result"], "ACCEPTED", (role, result))

    def outcome(self):
        return UnitOfWork(self.store).implementation_outcomes.get_version(
            self.base.tenant, self.base.outcome, 1
        )

    def test_full_command_path_creates_approves_and_revokes_without_execution_authority(self):
        self.create()
        self.approve_both()
        _, approved = self.execute(
            "ApproveImplementationOutcome",
            {"implementation_outcome_id": self.base.outcome, "outcome_version": 1},
            expected=1,
        )
        self.assertEqual(approved["result"], "ACCEPTED", approved)
        record = self.outcome()
        self.assertEqual(record["state"], "APPROVED")
        self.assertFalse(record["implementation_authority_granted"])
        self.assertFalse(record["deployment_authority_granted"])
        _, revoked = self.execute(
            "RevokeImplementationOutcome",
            {
                "implementation_outcome_id": self.base.outcome,
                "outcome_version": 1,
                "reason": "Client withdrew implementation intent.",
            },
            expected=2,
            caller="HUMAN",
            role="SEKINFRA_ENGAGEMENT_AUTHORITY",
        )
        self.assertEqual(revoked["result"], "ACCEPTED", revoked)
        self.assertEqual(self.outcome()["state"], "REVOKED")
        self.assertEqual(
            [event["event_type"] for event in self.store.events],
            [
                "implementation_outcome.draft_created",
                "implementation_outcome.approval_recorded",
                "implementation_outcome.approval_recorded",
                "implementation_outcome.approved",
                "implementation_outcome.revoked",
            ],
        )
        for event in self.store.events:
            self.assertFalse(list(self.event_schema.iter_errors(event)))
            encoded = json.dumps(event, sort_keys=True)
            for forbidden in ("approved_scope", "selected_finding_revisions", "implementation_requirements", "acceptance_criteria", "credential"):
                self.assertNotIn(forbidden, encoded)

    def test_client_can_record_approval_but_cannot_create_finalize_or_revoke(self):
        raw = self.raw("CreateImplementationOutcome", self.base.payload(), caller="HUMAN")
        result = self.executor.execute(
            raw,
            self.context(
                "implementation_outcome:write",
                caller="HUMAN",
                role="CLIENT_DECISION_AUTHORITY",
            ),
        )
        self.assertEqual(result["result"], "REJECTED")
        self.assertIsNone(self.outcome())

        self.create()
        payload = self.approval_payload("CLIENT_DECISION_AUTHORITY")
        _, recorded = self.execute(
            "RecordImplementationOutcomeApproval",
            payload,
            expected=1,
            caller="HUMAN",
            role="CLIENT_DECISION_AUTHORITY",
        )
        self.assertEqual(recorded["result"], "ACCEPTED", recorded)
        _, provider = self.execute(
            "RecordImplementationOutcomeApproval",
            self.approval_payload("SEKINFRA_ENGAGEMENT_AUTHORITY"),
            expected=1,
            caller="HUMAN",
            role="SEKINFRA_ENGAGEMENT_AUTHORITY",
        )
        self.assertEqual(provider["result"], "ACCEPTED", provider)
        raw = self.raw(
            "ApproveImplementationOutcome",
            {"implementation_outcome_id": self.base.outcome, "outcome_version": 1},
            expected=1,
            caller="HUMAN",
        )
        result = self.executor.execute(
            raw,
            self.context(
                "implementation_outcome:approve",
                caller="HUMAN",
                role="CLIENT_DECISION_AUTHORITY",
            ),
        )
        self.assertEqual(result["result"], "REJECTED")
        self.assertEqual(self.outcome()["state"], "DRAFT")
        _, approved = self.execute(
            "ApproveImplementationOutcome",
            {"implementation_outcome_id": self.base.outcome, "outcome_version": 1},
            expected=1,
        )
        self.assertEqual(approved["result"], "ACCEPTED", approved)
        raw = self.raw(
            "RevokeImplementationOutcome",
            {
                "implementation_outcome_id": self.base.outcome,
                "outcome_version": 1,
                "reason": "Client requested withdrawal.",
            },
            expected=2,
            caller="HUMAN",
        )
        result = self.executor.execute(
            raw,
            self.context(
                "implementation_outcome:revoke",
                caller="HUMAN",
                role="CLIENT_DECISION_AUTHORITY",
            ),
        )
        self.assertEqual(result["result"], "REJECTED")
        self.assertEqual(self.outcome()["state"], "APPROVED")

    def test_stale_cross_tenant_and_automation_paths_fail_closed(self):
        self.create()
        payload = self.approval_payload("CLIENT_DECISION_AUTHORITY")
        raw = self.raw(
            "RecordImplementationOutcomeApproval",
            payload,
            expected=99,
            caller="HUMAN",
        )
        stale = self.executor.execute(
            raw,
            self.context(
                "implementation_outcome:approve",
                caller="HUMAN",
                role="CLIENT_DECISION_AUTHORITY",
            ),
        )
        self.assertEqual(stale["result"], "REJECTED")
        self.assertEqual(stale["reason_code"], "VERSION_STALE")

        raw = self.raw("ApproveImplementationOutcome", {"implementation_outcome_id": self.base.outcome, "outcome_version": 1}, expected=1)
        cross = self.executor.execute(
            raw,
            self.context("implementation_outcome:approve", tenant="10000000-0000-4000-8000-000000000099"),
        )
        self.assertEqual(cross["result"], "REJECTED")
        self.assertEqual(cross["reason_code"], "TENANT_ACCESS_DENIED")

        raw = self.raw(
            "RecordImplementationOutcomeApproval",
            payload,
            expected=1,
            caller="N8N_ORCHESTRATOR",
        )
        automated = self.executor.execute(
            raw,
            self.context("implementation_outcome:approve", caller="N8N_ORCHESTRATOR"),
        )
        self.assertEqual(automated["result"], "VALIDATION_FAILED")
        self.assertEqual(self.outcome()["state"], "DRAFT")
    def test_idempotency_duplicate_approval_and_secret_payload_fail_closed(self):
        raw = self.raw(
            "CreateImplementationOutcome",
            self.base.payload(),
            key="implementation-outcome-create-fixed",
            command_id="d4000000-0000-4000-8000-000000000001",
        )
        context = self.context("implementation_outcome:write")
        first = self.executor.execute(raw, context)
        second = self.executor.execute(raw, context)
        self.assertEqual(first["result"], "ACCEPTED", first)
        self.assertEqual(second["result"], "DUPLICATE", second)

        payload = self.approval_payload("CLIENT_DECISION_AUTHORITY")
        _, recorded = self.execute(
            "RecordImplementationOutcomeApproval",
            payload,
            expected=1,
            caller="HUMAN",
            role="CLIENT_DECISION_AUTHORITY",
        )
        self.assertEqual(recorded["result"], "ACCEPTED", recorded)
        _, duplicate = self.execute(
            "RecordImplementationOutcomeApproval",
            payload,
            expected=1,
            caller="HUMAN",
            role="CLIENT_DECISION_AUTHORITY",
        )
        self.assertEqual(duplicate["result"], "REJECTED")

        other = self.base.payload()
        other["implementation_outcome_id"] = "70000000-0000-4000-8000-000000000099"
        other["implementation_handoff_id"] = "80000000-0000-4000-8000-000000000099"
        other["constraints"] = ["api_key=prohibited"]
        raw = self.raw("CreateImplementationOutcome", other)
        raw["subject_id"] = other["implementation_outcome_id"]
        rejected = self.executor.execute(raw, self.context("implementation_outcome:write"))
        self.assertEqual(rejected["result"], "REJECTED")
        self.assertIsNone(
            UnitOfWork(self.store).implementation_outcomes.get_version(
                self.base.tenant, other["implementation_outcome_id"], 1
            )
        )


if __name__ == "__main__":
    unittest.main()
