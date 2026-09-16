from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from sekinfra_consulting.guards import TrustedExecutionContext
from sekinfra_consulting.implementation_outcome import ImplementationOutcomeHandler, ImplementationOutcomeRejected
from sekinfra_consulting.in_memory import MemoryStore, UnitOfWork
from sekinfra_consulting.schema_registry import SchemaRegistry

ROOT = Path(__file__).resolve().parents[2]


class ImplementationOutcomeTests(unittest.TestCase):
    def setUp(self):
        self.tenant = "10000000-0000-4000-8000-000000000001"
        self.engagement = "60000000-0000-4000-8000-000000000001"
        self.assessment = "30000000-0000-4000-8000-000000000001"
        self.finding = "20000000-0000-4000-8000-000000000001"
        self.delivery = "40000000-0000-4000-8000-000000000001"
        self.conversion = "50000000-0000-4000-8000-000000000001"
        self.outcome = "70000000-0000-4000-8000-000000000001"
        self.handoff = "80000000-0000-4000-8000-000000000001"
        self.now = "2030-01-15T14:00:00Z"
        digest1 = "sha256:" + "1" * 64
        digest2 = "sha256:" + "2" * 64
        digest3 = "sha256:" + "3" * 64
        ref = {"oia_finding_id": self.finding, "finding_revision": 2, "content_digest": digest1}
        self.store = MemoryStore()
        self.store.engagements[self.engagement] = {"tenant_id": self.tenant, "engagement_id": self.engagement, "engagement_state": "OPEN"}
        self.store.oia_findings[(self.tenant, self.finding, 2)] = {
            "tenant_id": self.tenant, "oia_finding_id": self.finding, "oia_assessment_id": self.assessment,
            "finding_revision": 2, "state": "FINAL", "content_digest": digest1,
            "verified_operational_problem": "Scheduling handoffs are inconsistent.",
            "desired_outcome": "Scheduling handoffs are deterministic and auditable.",
        }
        self.store.oia_findings_deliveries[(self.tenant, self.delivery)] = {
            "tenant_id": self.tenant, "oia_findings_delivery_id": self.delivery, "oia_assessment_id": self.assessment,
            "delivery_sequence": 3, "finding_revisions": [ref], "manifest_digest": digest2,
        }
        self.store.oia_conversion_decisions[(self.tenant, self.conversion, 1)] = {
            "tenant_id": self.tenant, "engagement_id": self.engagement,
            "oia_conversion_decision_id": self.conversion, "decision_version": 1,
            "oia_assessment_id": self.assessment, "oia_findings_delivery_id": self.delivery,
            "delivery_sequence": 3, "delivery_manifest_digest": digest2,
            "decision": "PROCEED", "state": "ACCEPTED", "selected_finding_revisions": [ref],
            "conversion_authority_digest": digest3, "created_at": self.now,
        }
        self.uow = UnitOfWork(self.store)
        self.handler = ImplementationOutcomeHandler(self.uow)
        self.schema = Draft202012Validator(
            json.loads((ROOT / "contracts/schemas/v1/domain/implementation-outcome.schema.json").read_text()),
            format_checker=FormatChecker(),
        )
        self.public_schema = Draft202012Validator(
            json.loads((ROOT / "contracts/public/implementation-handoff.schema.json").read_text()),
            format_checker=FormatChecker(),
        )
        self.approval_schema = Draft202012Validator(
            SchemaRegistry(ROOT / "contracts/schemas/v1").expanded("urn:sekinfra:schema:contracts:domain:human-approval:v1"),
            format_checker=FormatChecker(),
        )

    def context(self, capability, *, role=None, tenant=None, caller="INTERNAL_SERVICE"):
        return TrustedExecutionContext(
            True, "principal.test", caller, tenant or self.tenant, "organization.test",
            frozenset({capability}), frozenset({role} if role else set()), "TEST",
            "sekinfra-consulting-api", "MFA" if caller == "HUMAN" else "SERVICE",
            True, self.now, human_principal_reference=(f"human:{role.lower()}" if role else None),
            human_organization_reference=(f"organization:{role.lower()}" if role else None),
            human_authority_role=role,
        )

    def payload(self, version=1):
        return {
            "implementation_outcome_id": self.outcome,
            "implementation_handoff_id": self.handoff,
            "engagement_id": self.engagement,
            "outcome_version": version,
            "oia_conversion_decision_id": self.conversion,
            "decision_version": 1,
            "client_reference": "client.fictional.operations",
            "approved_scope": [{"scope_item_id": "scope.scheduling", "description": "Correct bounded scheduling handoffs.", "action_classes": ["MODIFY_APPLICATION"], "target_references": [{"reference_type": "REPOSITORY", "reference_id": "repository.fictional.scheduler"}]}],
            "excluded_scope": ["Production deployment is excluded."],
            "constraints": ["Preserve existing client records."],
            "context_references": [],
            "integrations": [{"id": "integration.calendar", "statement": "Existing calendar API boundary."}],
            "allowed_access_level": "SANDBOX_ONLY",
            "risks": [{"id": "risk.concurrent-edits", "statement": "Concurrent edits may conflict."}],
            "implementation_requirements": [{"id": "requirement.atomic", "statement": "Apply scheduling updates atomically."}],
            "acceptance_criteria": [{"criterion_id": "criterion.audit", "expected_condition": "Every scheduling change is attributable.", "evidence_requirement": "Automated audit trail test reference."}],
            "prohibited_changes": ["No deployment or production credential access."],
            "dependencies": [],
            "assumptions_limitations": ["Client calendar API remains available."],
        }

    def approval_payload(self, role, approval_id, version=1):
        return {
            "implementation_outcome_id": self.outcome, "outcome_version": version,
            "authority_role": role, "approval_id": approval_id,
            "evidence_reference": {"source_system": "fictional-approval", "object_type": "SOURCE_RECORD", "external_id": approval_id, "environment": "TEST"},
            "correlation_id": "90000000-0000-4000-8000-000000000001",
            "idempotency_key": f"implementation-outcome-{version}-{role.lower()}",
        }

    def approve_version(self, version=1):
        for role, approval_id in (
            ("CLIENT_DECISION_AUTHORITY", f"a1000000-0000-4000-8000-{version:012d}"),
            ("SEKINFRA_ENGAGEMENT_AUTHORITY", f"a2000000-0000-4000-8000-{version:012d}"),
        ):
            approval = self.handler.record_approval(
                self.context("implementation_outcome:approve", role=role, caller="HUMAN"),
                self.approval_payload(role, approval_id, version), self.now,
            )
            self.assertFalse(list(self.approval_schema.iter_errors(approval)))
        return self.handler.approve(
            self.context("implementation_outcome:approve"),
            {"implementation_outcome_id": self.outcome, "outcome_version": version, "expected_record_version": 1},
            self.now,
        )

    def test_exact_conversion_dual_approval_produces_public_handoff(self):
        draft = self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        self.assertEqual(draft["state"], "DRAFT")
        self.assertFalse(draft["implementation_authority_granted"])
        self.assertFalse(draft["deployment_authority_granted"])
        self.assertEqual(draft["selected_finding_revisions"], self.store.oia_conversion_decisions[(self.tenant, self.conversion, 1)]["selected_finding_revisions"])
        self.assertFalse(list(self.schema.iter_errors(draft)))
        approved = self.approve_version()
        self.assertEqual(approved["state"], "APPROVED")
        self.assertEqual({x["approval_role"] for x in approved["upstream_approval_references"]}, {"CLIENT_APPROVER", "PROVIDER_APPROVER"})
        self.assertFalse(list(self.schema.iter_errors(approved)))
        handoff = self.handler.build_handoff(self.context("implementation_outcome:approve"), self.outcome, 1)
        self.assertFalse(list(self.public_schema.iter_errors(handoff)))
        self.assertEqual(handoff["state"], "APPROVED")
        self.assertEqual(handoff["source_engagement_reference"], self.engagement)
        self.assertNotIn("implementation_authority_granted", handoff)
        self.assertNotIn("deployment_authority_granted", handoff)

    def test_missing_approval_secret_and_stale_sources_fail_closed(self):
        self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        self.handler.record_approval(
            self.context("implementation_outcome:approve", role="CLIENT_DECISION_AUTHORITY", caller="HUMAN"),
            self.approval_payload("CLIENT_DECISION_AUTHORITY", "a3000000-0000-4000-8000-000000000001"), self.now,
        )
        with self.assertRaises(ImplementationOutcomeRejected):
            self.handler.approve(self.context("implementation_outcome:approve"), {"implementation_outcome_id": self.outcome, "outcome_version": 1, "expected_record_version": 1}, self.now)
        other = self.payload(); other["implementation_outcome_id"] = "70000000-0000-4000-8000-000000000002"; other["implementation_handoff_id"] = "80000000-0000-4000-8000-000000000002"; other["constraints"] = ["api_key=prohibited"]
        with self.assertRaises(ValueError):
            self.handler.create_draft(self.context("implementation_outcome:write"), other, self.now)
        self.store.oia_conversion_decisions[(self.tenant, self.conversion, 1)]["state"] = "PENDING_SEKINFRA"
        stale = self.payload(); stale["implementation_outcome_id"] = "70000000-0000-4000-8000-000000000003"; stale["implementation_handoff_id"] = "80000000-0000-4000-8000-000000000003"
        uow = UnitOfWork(self.store)
        with self.assertRaises(ImplementationOutcomeRejected):
            ImplementationOutcomeHandler(uow).create_draft(self.context("implementation_outcome:write"), stale, self.now)

    def test_wrong_tenant_and_nonfinal_finding_are_rejected(self):
        with self.assertRaises(ImplementationOutcomeRejected):
            self.handler.create_draft(self.context("implementation_outcome:write", tenant="10000000-0000-4000-8000-000000000099"), self.payload(), self.now)
        self.store.oia_findings[(self.tenant, self.finding, 2)]["state"] = "DRAFT"
        uow = UnitOfWork(self.store)
        with self.assertRaises(ImplementationOutcomeRejected):
            ImplementationOutcomeHandler(uow).create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)

    def test_version_two_requires_exact_predecessors_and_supersedes_version_one(self):
        first = self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        approved1 = self.approve_version()
        handoff1 = self.handler.build_handoff(self.context("implementation_outcome:approve"), self.outcome, 1)
        p2 = self.payload(2)
        p2["implementation_requirements"] = [{"id": "requirement.atomic", "statement": "Apply scheduling updates atomically with retry protection."}]
        p2["supersedes_outcome_reference"] = {"reference_type": "IMPLEMENTATION_OUTCOME", "reference_id": self.outcome, "reference_version": 1, "reference_digest": approved1["outcome_authority_digest"]}
        p2["supersedes_handoff_reference"] = {"reference_type": "IMPLEMENTATION_HANDOFF", "reference_id": self.handoff, "reference_version": 1, "reference_digest": handoff1["handoff_digest"]}
        draft2 = self.handler.create_draft(self.context("implementation_outcome:write"), p2, "2030-01-16T14:00:00Z")
        self.assertEqual(draft2["outcome_version"], 2)
        approved2 = self.approve_version(2)
        self.assertEqual(approved2["state"], "APPROVED")
        self.assertEqual(self.uow.implementation_outcomes.get_version(self.tenant, self.outcome, 1)["state"], "SUPERSEDED")
        handoff2 = self.handler.build_handoff(self.context("implementation_outcome:approve"), self.outcome, 2)
        self.assertEqual(handoff2["supersedes_handoff_reference"], p2["supersedes_handoff_reference"])
        self.assertFalse(list(self.public_schema.iter_errors(handoff2)))


    def test_upstream_truth_changing_after_draft_blocks_approval(self):
        self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        self.uow.commit()
        later = copy.deepcopy(self.store.oia_conversion_decisions[(self.tenant, self.conversion, 1)])
        later["decision_version"] = 2
        later["conversion_authority_digest"] = "sha256:" + "9" * 64
        later["created_at"] = "2030-01-16T14:00:00Z"
        self.store.oia_conversion_decisions[(self.tenant, self.conversion, 2)] = later
        refreshed = UnitOfWork(self.store)
        handler = ImplementationOutcomeHandler(refreshed)
        for role, approval_id in (("CLIENT_DECISION_AUTHORITY", "a4000000-0000-4000-8000-000000000001"), ("SEKINFRA_ENGAGEMENT_AUTHORITY", "a5000000-0000-4000-8000-000000000001")):
            handler.record_approval(self.context("implementation_outcome:approve", role=role, caller="HUMAN"), self.approval_payload(role, approval_id), self.now)
        with self.assertRaises(ImplementationOutcomeRejected):
            handler.approve(self.context("implementation_outcome:approve"), {"implementation_outcome_id": self.outcome, "outcome_version": 1, "expected_record_version": 1}, self.now)

    def test_client_authority_can_approve_but_cannot_draft_finalize_or_emit(self):
        client_write = self.context(
            "implementation_outcome:write", role="CLIENT_DECISION_AUTHORITY", caller="HUMAN"
        )
        with self.assertRaises(ImplementationOutcomeRejected):
            self.handler.create_draft(client_write, self.payload(), self.now)

        self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        for role, approval_id in (
            ("CLIENT_DECISION_AUTHORITY", "a6000000-0000-4000-8000-000000000001"),
            ("SEKINFRA_ENGAGEMENT_AUTHORITY", "a7000000-0000-4000-8000-000000000001"),
        ):
            self.handler.record_approval(
                self.context("implementation_outcome:approve", role=role, caller="HUMAN"),
                self.approval_payload(role, approval_id), self.now,
            )

        client_approve = self.context(
            "implementation_outcome:approve", role="CLIENT_DECISION_AUTHORITY", caller="HUMAN"
        )
        with self.assertRaises(ImplementationOutcomeRejected):
            self.handler.approve(
                client_approve,
                {"implementation_outcome_id": self.outcome, "outcome_version": 1, "expected_record_version": 1},
                self.now,
            )

        approved = self.handler.approve(
            self.context("implementation_outcome:approve"),
            {"implementation_outcome_id": self.outcome, "outcome_version": 1, "expected_record_version": 1},
            self.now,
        )
        self.assertEqual(approved["state"], "APPROVED")
        with self.assertRaises(ImplementationOutcomeRejected):
            self.handler.build_handoff(client_approve, self.outcome, 1)

    def test_implementation_outcome_binding_is_exclusive_to_outcome_approvals(self):
        self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        approval = self.handler.record_approval(
            self.context(
                "implementation_outcome:approve", role="CLIENT_DECISION_AUTHORITY", caller="HUMAN"
            ),
            self.approval_payload(
                "CLIENT_DECISION_AUTHORITY", "a8000000-0000-4000-8000-000000000001"
            ),
            self.now,
        )
        self.assertFalse(list(self.approval_schema.iter_errors(approval)))

        mixed = copy.deepcopy(approval)
        mixed.update(
            subject_type="OIA_CONVERSION_DECISION",
            subject_id=self.conversion,
            subject_version=1,
            approval_category="CONVERSION",
            phase5c_authority={
                "subject_id": self.conversion,
                "authority_digest": self.store.oia_conversion_decisions[
                    (self.tenant, self.conversion, 1)
                ]["conversion_authority_digest"],
            },
        )
        self.assertTrue(list(self.approval_schema.iter_errors(mixed)))

    def test_revoke_preserves_no_execution_authority(self):
        self.handler.create_draft(self.context("implementation_outcome:write"), self.payload(), self.now)
        approved = self.approve_version()
        revoked = self.handler.revoke(
            self.context("implementation_outcome:revoke", role="SEKINFRA_ENGAGEMENT_AUTHORITY", caller="HUMAN"),
            {"implementation_outcome_id": self.outcome, "outcome_version": 1, "expected_record_version": approved["record_version"], "reason": "Client withdrew implementation intent."},
            "2030-01-17T14:00:00Z",
        )
        self.assertEqual(revoked["state"], "REVOKED")
        with self.assertRaises(ImplementationOutcomeRejected):
            self.handler.build_handoff(self.context("implementation_outcome:approve"), self.outcome, 1)


if __name__ == "__main__":
    unittest.main()
