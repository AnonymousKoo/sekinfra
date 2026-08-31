from __future__ import annotations

import copy
import json
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from sekinfra_consulting.implementation_handoff import canonical_digest, produce_implementation_handoff


ROOT = Path(__file__).resolve().parents[1]


class ImplementationHandoffProducerTests(unittest.TestCase):
    def setUp(self):
        self.finding = {
            "tenant_id": "10000000-0000-4000-8000-000000000001",
            "oia_finding_id": "20000000-0000-4000-8000-000000000001",
            "oia_assessment_id": "30000000-0000-4000-8000-000000000001",
            "finding_revision": 2, "state": "FINAL",
            "verified_operational_problem": "Scheduling handoffs are inconsistent.",
            "desired_outcome": "Scheduling handoffs are deterministic and auditable.",
            "content_digest": "sha256:" + "1" * 64,
        }
        ref = {"oia_finding_id": self.finding["oia_finding_id"], "finding_revision": 2, "content_digest": self.finding["content_digest"]}
        self.delivery = {
            "oia_findings_delivery_id": "40000000-0000-4000-8000-000000000001",
            "oia_assessment_id": self.finding["oia_assessment_id"], "delivery_sequence": 3,
            "finding_revisions": [ref], "manifest_digest": "sha256:" + "2" * 64,
        }
        self.conversion = {
            "oia_conversion_decision_id": "50000000-0000-4000-8000-000000000001",
            "decision_version": 1, "tenant_id": self.finding["tenant_id"],
            "engagement_id": "60000000-0000-4000-8000-000000000001",
            "oia_assessment_id": self.finding["oia_assessment_id"],
            "oia_findings_delivery_id": self.delivery["oia_findings_delivery_id"],
            "delivery_sequence": 3, "delivery_manifest_digest": self.delivery["manifest_digest"],
            "decision": "PROCEED", "state": "ACCEPTED", "selected_finding_revisions": [ref],
            "conversion_authority_digest": "sha256:" + "3" * 64,
        }
        self.outcome = {
            "implementation_handoff_id": "70000000-0000-4000-8000-000000000001",
            "handoff_version": 1, "tenant_id": self.finding["tenant_id"],
            "engagement_id": self.conversion["engagement_id"], "client_reference": "client.fictional.operations",
            "state": "APPROVED", "source_conversion_reference": {
                "reference_id": self.conversion["oia_conversion_decision_id"], "reference_version": 1,
                "reference_digest": self.conversion["conversion_authority_digest"],
            },
            "approved_scope": [{"scope_item_id": "scope.scheduling", "description": "Correct bounded scheduling handoffs.", "action_classes": ["MODIFY_APPLICATION"], "target_references": [{"reference_type": "REPOSITORY", "reference_id": "repository.fictional.scheduler"}]}],
            "excluded_scope": ["Production deployment is excluded."],
            "constraints": ["Preserve existing client records."], "context_references": [],
            "integrations": [{"id": "integration.calendar", "statement": "Existing calendar API boundary."}],
            "allowed_access_level": "SANDBOX_ONLY",
            "risks": [{"id": "risk.concurrent-edits", "statement": "Concurrent edits may conflict."}],
            "implementation_requirements": [{"id": "requirement.atomic", "statement": "Apply scheduling updates atomically."}],
            "acceptance_criteria": [{"criterion_id": "criterion.audit", "expected_condition": "Every scheduling change is attributable.", "evidence_requirement": "Automated audit-trail test reference."}],
            "prohibited_changes": ["No deployment or production credential access."],
            "dependencies": [], "assumptions_limitations": ["Client calendar API remains available."],
            "upstream_approval_references": [
                {"approval_role": "CLIENT_APPROVER", "approval_reference": "approval.client.001", "approved_by": "human.client-authority", "approved_at": "2030-01-15T14:00:00Z"},
                {"approval_role": "PROVIDER_APPROVER", "approval_reference": "approval.sekinfra.001", "approved_by": "human.sekinfra-authority", "approved_at": "2030-01-15T14:01:00Z"},
            ],
            "approved_at": "2030-01-15T14:01:00Z", "created_at": "2030-01-15T14:01:00Z",
        }
        schema = json.loads((ROOT / "contracts/public/implementation-handoff.schema.json").read_text())
        self.validator = Draft202012Validator(schema, format_checker=FormatChecker())

    def produce(self):
        return produce_implementation_handoff(outcome=self.outcome, conversion=self.conversion, delivery=self.delivery, findings=[self.finding])

    def test_deterministic_schema_valid_provider_neutral_handoff(self):
        first = self.produce(); second = self.produce()
        self.assertEqual(first, second)
        self.assertFalse(list(self.validator.iter_errors(first)))
        digestless = {key: value for key, value in first.items() if key != "handoff_digest"}
        self.assertEqual(first["handoff_digest"], canonical_digest(digestless))
        self.assertNotIn("oia_assessment_id", first)
        self.assertNotIn("finding_revision", first)

    def test_stale_or_unapproved_sources_are_rejected(self):
        mutations = [
            (self.outcome, "state", "DRAFT"),
            (self.conversion, "state", "PENDING_SEKINFRA"),
            (self.delivery, "manifest_digest", "sha256:" + "9" * 64),
            (self.finding, "content_digest", "sha256:" + "8" * 64),
        ]
        for source, key, value in mutations:
            original = source[key]; source[key] = value
            with self.assertRaises(ValueError): self.produce()
            source[key] = original

    def test_secret_fields_values_and_missing_dual_approval_are_rejected(self):
        self.outcome["api_token"] = "prohibited"
        with self.assertRaises(ValueError): self.produce()
        self.outcome.pop("api_token")
        self.outcome["constraints"].append("api_key=fictional-but-prohibited")
        with self.assertRaises(ValueError): self.produce()
        self.outcome["constraints"].pop()
        self.outcome["upstream_approval_references"].pop()
        with self.assertRaises(ValueError): self.produce()

    def test_revisions_require_exact_predecessor_shape(self):
        first = self.produce()
        self.outcome["handoff_version"] = 2
        self.outcome["supersedes_handoff_reference"] = {
            "reference_type": "IMPLEMENTATION_HANDOFF",
            "reference_id": first["implementation_handoff_id"],
            "reference_version": first["handoff_version"],
            "reference_digest": first["handoff_digest"],
        }
        revised = self.produce()
        self.assertFalse(list(self.validator.iter_errors(revised)))
        self.outcome["supersedes_handoff_reference"]["reference_version"] = 2
        with self.assertRaises(ValueError):
            self.produce()


if __name__ == "__main__":
    unittest.main()
