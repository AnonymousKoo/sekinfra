import copy
import sys
import unittest
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from sekinfra_consulting.in_memory import MemoryStore, UnitOfWork
from sekinfra_consulting.oia_read_models import OIAEngagementProgressReadService
from sekinfra_consulting.schema_registry import SchemaRegistry


class OIAEngagementProgressReadModelTests(unittest.TestCase):
    tenant = "a3000000-0000-4000-8000-000000000001"
    other_tenant = "a3000000-0000-4000-8000-000000000099"
    engagement_id = "a3000000-0000-4000-8000-000000000002"
    scope_id = "a3000000-0000-4000-8000-000000000003"
    agreement_id = "a3000000-0000-4000-8000-000000000004"
    payment_id = "a3000000-0000-4000-8000-000000000005"
    grant_id = "a3000000-0000-4000-8000-000000000006"
    assessment_id = "a3000000-0000-4000-8000-000000000007"
    plan_id = "a3000000-0000-4000-8000-000000000008"
    item_id = "a3000000-0000-4000-8000-000000000009"
    finding_id = "a3000000-0000-4000-8000-000000000010"
    delivery_id = "a3000000-0000-4000-8000-000000000011"
    decision_id = "a3000000-0000-4000-8000-000000000012"
    now = "2030-01-15T15:00:00Z"
    digest = "sha256:" + "a" * 64

    def base_store(self):
        store = MemoryStore()
        store.engagements[self.engagement_id] = {
            "tenant_id": self.tenant,
            "engagement_id": self.engagement_id,
            "engagement_state": "OPEN",
            "record_version": 1,
        }
        store.scopes[self.scope_id] = {
            "tenant_id": self.tenant,
            "engagement_id": self.engagement_id,
            "diagnostic_scope_id": self.scope_id,
            "scope_version": 1,
            "record_version": 2,
            "status": "APPROVED",
            "canonical_scope_digest": self.digest,
            "action_set_version": 1,
            "in_scope_systems": [{"system_reference_id": "system-001"}],
            "permitted_diagnostic_actions": ["VIEW_CONFIGURATION", "VIEW_METRICS"],
        }
        store.agreements[self.agreement_id] = {
            "tenant_id": self.tenant,
            "engagement_id": self.engagement_id,
            "diagnostic_agreement_authority_id": self.agreement_id,
            "record_version": 1,
            "status": "VERIFIED_ACTIVE",
            "scope_reference": {
                "reference_type": "DIAGNOSTIC_SCOPE",
                "reference_id": self.scope_id,
                "reference_version": 1,
            },
            "canonical_scope_digest": self.digest,
            "effective_at": "2030-01-01T00:00:00Z",
            "ends_at": "2030-03-01T00:00:00Z",
        }
        store.payments[self.payment_id] = {
            "tenant_id": self.tenant,
            "engagement_id": self.engagement_id,
            "diagnostic_payment_verification_id": self.payment_id,
            "record_version": 1,
            "payment_purpose": "DIAGNOSTIC_OIA",
            "verification_status": "VERIFIED",
            "diagnostic_agreement_authority_reference": {
                "reference_id": self.agreement_id,
            },
        }
        store.grants[(self.tenant, self.grant_id)] = {
            "tenant_id": self.tenant,
            "engagement_id": self.engagement_id,
            "assessment_access_grant_id": self.grant_id,
            "record_version": 2,
            "status": "ACTIVE",
            "active_from": "2030-01-15T14:00:00Z",
            "expires_at": "2030-02-15T15:00:00Z",
            "diagnostic_scope_reference": {
                "reference_type": "DIAGNOSTIC_SCOPE",
                "reference_id": self.scope_id,
                "reference_version": 1,
            },
            "canonical_scope_digest": self.digest,
            "action_set_version": 1,
            "diagnostic_agreement_authority_reference": {
                "reference_type": "DIAGNOSTIC_AGREEMENT_AUTHORITY",
                "reference_id": self.agreement_id,
                "reference_version": 1,
            },
            "diagnostic_payment_verification_reference": {
                "reference_type": "DIAGNOSTIC_PAYMENT_VERIFICATION",
                "reference_id": self.payment_id,
                "reference_version": 1,
            },
            "target_system_references": [{"system_reference_id": "system-001"}],
            "permitted_actions": ["VIEW_CONFIGURATION", "VIEW_METRICS"],
        }
        store.oia_assessments[(self.tenant, self.assessment_id)] = {
            "tenant_id": self.tenant,
            "oia_assessment_id": self.assessment_id,
            "engagement_id": self.engagement_id,
            "diagnostic_scope_id": self.scope_id,
            "diagnostic_scope_version": 1,
            "canonical_scope_digest": self.digest,
            "assessment_access_grant_id": self.grant_id,
            "state": "IN_PROGRESS",
            "record_version": 1,
            "opened_at": self.now,
            "created_at": self.now,
            "updated_at": self.now,
        }
        return store

    def plan(self, state="APPROVED"):
        result = {
            "tenant_id": self.tenant,
            "oia_assessment_plan_id": self.plan_id,
            "engagement_id": self.engagement_id,
            "oia_assessment_id": self.assessment_id,
            "diagnostic_scope_id": self.scope_id,
            "diagnostic_scope_version": 1,
            "canonical_scope_digest": self.digest,
            "plan_version": 1,
            "state": state,
            "record_version": 1,
            "created_at": self.now,
            "updated_at": self.now,
        }
        return result

    def resolved_inspection(self):
        return {
            "tenant_id": self.tenant,
            "oia_inspection_item_id": self.item_id,
            "oia_assessment_id": self.assessment_id,
            "oia_assessment_plan_id": self.plan_id,
            "plan_version": 1,
            "required": True,
            "coverage_state": "SUFFICIENTLY_EVIDENCED",
            "limitations": [],
            "sufficiency_evaluation": {"contradiction_state": "NONE"},
        }

    def evidence(self, evidence_id, evidence_type, source_system_reference, secure_reference):
        return {
            "tenant_id": self.tenant,
            "oia_evidence_id": evidence_id,
            "oia_assessment_id": self.assessment_id,
            "source_system_reference": source_system_reference,
            "evidence_type": evidence_type,
            "secure_object_reference": secure_reference,
        }

    def delivery(self):
        return {
            "tenant_id": self.tenant,
            "oia_findings_delivery_id": self.delivery_id,
            "oia_assessment_id": self.assessment_id,
            "delivery_sequence": 1,
            "delivered_at": self.now,
        }

    def conversion(self, state="PENDING_SEKINFRA", assessment_id=None, delivery_id=None):
        return {
            "tenant_id": self.tenant,
            "engagement_id": self.engagement_id,
            "oia_conversion_decision_id": self.decision_id,
            "decision_version": 1,
            "oia_assessment_id": assessment_id or self.assessment_id,
            "oia_findings_delivery_id": delivery_id or self.delivery_id,
            "decision": "PROCEED" if state != "DECLINED" else "DECLINE",
            "state": state,
            "record_version": 1,
            "created_at": self.now,
        }

    def view(self, store):
        return OIAEngagementProgressReadService(UnitOfWork(store)).progress(
            self.tenant, self.engagement_id, self.assessment_id, self.now
        )

    def validator(self):
        schema = SchemaRegistry(ROOT / "contracts/schemas/v1").expanded(
            "urn:sekinfra:schema:contracts:read-models:oia-engagement-progress-view:v1"
        )
        return Draft202012Validator(schema, format_checker=FormatChecker())

    def test_exact_assessment_projection_is_schema_valid_and_does_not_leak_secure_evidence(self):
        store = self.base_store()
        store.oia_evidence_items[(self.tenant, "a3000000-0000-4000-8000-000000000021")] = self.evidence(
            "a3000000-0000-4000-8000-000000000021", "CONFIGURATION_SNAPSHOT", "system-001", "secure-object-secret-001"
        )
        store.oia_evidence_items[(self.tenant, "a3000000-0000-4000-8000-000000000022")] = self.evidence(
            "a3000000-0000-4000-8000-000000000022", "METRIC_SNAPSHOT", "system-001", "secure-object-secret-002"
        )
        view = self.view(store)
        self.assertEqual(list(self.validator().iter_errors(view)), [])
        self.assertEqual(view["assessment_access"]["usable"], True)
        self.assertEqual(view["evidence_progress"]["evidence_count"], 2)
        self.assertEqual(view["next_required_action"]["code"], "CREATE_ASSESSMENT_PLAN")
        serialized = repr(view)
        self.assertNotIn("secure-object-secret", serialized)
        self.assertNotIn("secure_object_reference", serialized)
        self.assertFalse(view["implementation_authorized"])
        self.assertFalse(view["deployment_authorized"])

    def test_plan_lifecycle_drives_bounded_next_action_without_creating_authority(self):
        for state, expected in (("DRAFT", "REVIEW_ASSESSMENT_PLAN"), ("REVIEWED", "APPROVE_ASSESSMENT_PLAN")):
            with self.subTest(state=state):
                store = self.base_store()
                store.oia_assessment_plans[(self.tenant, self.plan_id, 1)] = self.plan(state)
                view = self.view(store)
                self.assertEqual(view["next_required_action"]["code"], expected)
                self.assertFalse(view["implementation_authorized"])

    def test_no_findings_path_remains_an_explicit_domain_gap(self):
        store = self.base_store()
        store.oia_assessment_plans[(self.tenant, self.plan_id, 1)] = self.plan("APPROVED")
        store.oia_inspection_items[(self.tenant, self.item_id)] = self.resolved_inspection()
        view = self.view(store)
        self.assertEqual(view["inspection_coverage"]["ready_for_observation_analysis"], True)
        self.assertEqual(view["findings"]["finding_set_readiness"]["reason_codes"], ["NO_FINDINGS"])
        self.assertEqual(view["next_required_action"], {
            "code": "DOMAIN_GAP_REQUIRES_DECISION",
            "reason_codes": ["NO_FINDINGS"],
        })
        self.assertNotIn("assessment_conclusion", view)

    def test_unresolved_draft_finding_requires_finding_resolution(self):
        store = self.base_store()
        store.oia_assessment_plans[(self.tenant, self.plan_id, 1)] = self.plan("APPROVED")
        store.oia_inspection_items[(self.tenant, self.item_id)] = self.resolved_inspection()
        store.oia_findings[(self.tenant, self.finding_id, 1)] = {
            "tenant_id": self.tenant,
            "oia_finding_id": self.finding_id,
            "oia_assessment_id": self.assessment_id,
            "finding_revision": 1,
            "state": "DRAFT",
        }
        view = self.view(store)
        self.assertEqual(view["findings"]["draft_finding_count"], 1)
        self.assertEqual(view["next_required_action"]["code"], "RESOLVE_FINDING_SET")
        self.assertEqual(view["next_required_action"]["reason_codes"], ["UNRESOLVED_FINDING_REVISION"])

    def test_delivery_and_conversion_progression_is_exact_assessment_bound(self):
        store = self.base_store()
        assessment = store.oia_assessments[(self.tenant, self.assessment_id)]
        assessment.update(
            state="FINDINGS_DELIVERED",
            ready_for_delivery_at=self.now,
            findings_delivered_at=self.now,
            findings_delivery_id=self.delivery_id,
            record_version=3,
        )
        store.oia_findings_deliveries[(self.tenant, self.delivery_id)] = self.delivery()
        first = self.view(store)
        self.assertEqual(first["next_required_action"]["code"], "RECORD_CONVERSION_DECISION")

        store.oia_conversion_decisions[(self.tenant, self.decision_id, 1)] = self.conversion("PENDING_SEKINFRA")
        pending = self.view(store)
        self.assertEqual(pending["next_required_action"]["code"], "RESOLVE_CONVERSION_DECISION")

        store.oia_conversion_decisions[(self.tenant, self.decision_id, 1)] = self.conversion("ACCEPTED")
        accepted = self.view(store)
        self.assertTrue(accepted["phase5c_progression"]["conversion_accepted"])
        self.assertEqual(accepted["next_required_action"]["code"], "ESTABLISH_ONGOING_AGREEMENT")
        self.assertFalse(accepted["phase5c_progression"]["implementation_authorized"])

    def test_conversion_binding_mismatch_is_not_silently_projected(self):
        store = self.base_store()
        assessment = store.oia_assessments[(self.tenant, self.assessment_id)]
        assessment.update(
            state="FINDINGS_DELIVERED",
            ready_for_delivery_at=self.now,
            findings_delivered_at=self.now,
            findings_delivery_id=self.delivery_id,
            record_version=3,
        )
        store.oia_findings_deliveries[(self.tenant, self.delivery_id)] = self.delivery()
        store.oia_conversion_decisions[(self.tenant, self.decision_id, 1)] = self.conversion(
            "PENDING_SEKINFRA", assessment_id="a3000000-0000-4000-8000-000000000077"
        )
        view = self.view(store)
        self.assertNotIn("conversion", view)
        self.assertEqual(view["next_required_action"], {
            "code": "DOMAIN_GAP_REQUIRES_DECISION",
            "reason_codes": ["CONVERSION_BINDING_MISMATCH"],
        })

    def test_closed_assessment_without_conversion_has_no_required_oia_action(self):
        store = self.base_store()
        assessment = store.oia_assessments[(self.tenant, self.assessment_id)]
        assessment.update(
            state="CLOSED",
            ready_for_delivery_at=self.now,
            findings_delivered_at=self.now,
            findings_delivery_id=self.delivery_id,
            closed_at=self.now,
            record_version=4,
        )
        store.oia_findings_deliveries[(self.tenant, self.delivery_id)] = self.delivery()
        view = self.view(store)
        self.assertEqual(view["next_required_action"], {
            "code": "NO_REQUIRED_OIA_ACTION",
            "reason_codes": ["ASSESSMENT_CLOSED"],
        })

    def test_tenant_and_binding_fail_closed(self):
        service = OIAEngagementProgressReadService(UnitOfWork(self.base_store()))
        self.assertIsNone(service.progress(self.other_tenant, self.engagement_id, self.assessment_id, self.now))
        store = self.base_store()
        store.scopes[self.scope_id]["scope_version"] = 2
        with self.assertRaisesRegex(ValueError, "scope binding"):
            self.view(store)

    def test_schema_rejects_invented_assessment_conclusion(self):
        view = self.view(self.base_store())
        mutated = copy.deepcopy(view)
        mutated["assessment_conclusion"] = "NO_MATERIAL_FINDINGS"
        self.assertTrue(list(self.validator().iter_errors(mutated)))


if __name__ == "__main__":
    unittest.main()
