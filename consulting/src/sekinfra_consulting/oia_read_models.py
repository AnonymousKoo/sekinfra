"""Tenant-bounded OIA read models composed from authoritative stored facts.

These projections are read-only and non-authoritative. They never create authority,
select an ambiguous "current" assessment, or imply implementation/deployment rights.
"""
from __future__ import annotations

from collections import Counter

from .assessment_access_usability import evaluate_assessment_access_usability
from .oia_finding import derive_finding_set_readiness
from .phase5c import Phase5CReadService


_COVERAGE_STATES = (
    "NOT_STARTED",
    "IN_PROGRESS",
    "PARTIALLY_EVIDENCED",
    "SUFFICIENTLY_EVIDENCED",
    "BLOCKED",
    "NOT_APPLICABLE",
)
class OIAEngagementProgressReadService:
    """Compose one exact assessment's cross-lifecycle OIA progress view."""

    def __init__(self, repositories):
        self.repositories = repositories
        self.phase5c = Phase5CReadService(repositories)

    def progress(self, tenant_id, engagement_id, oia_assessment_id, generated_at):
        engagement = self.repositories.engagements.get(tenant_id, engagement_id)
        assessment = self.repositories.oia_assessments.get(tenant_id, oia_assessment_id)
        if not engagement or not assessment or assessment.get("engagement_id") != engagement_id:
            return None

        scope = self.repositories.diagnostic_scopes.get(
            tenant_id, assessment["diagnostic_scope_id"]
        )
        if (
            not scope
            or scope.get("engagement_id") != engagement_id
            or scope.get("scope_version") != assessment.get("diagnostic_scope_version")
        ):
            raise ValueError("OIA assessment diagnostic scope binding is not authoritative")

        grant = self.repositories.assessment_access_grants.get(
            tenant_id, assessment["assessment_access_grant_id"]
        )
        if not grant or grant.get("engagement_id") != engagement_id:
            raise ValueError("OIA assessment access grant binding is not authoritative")

        access_usability = evaluate_assessment_access_usability(
            self.repositories, tenant_id, assessment["assessment_access_grant_id"], generated_at
        )
        access = {
            "assessment_access_grant_id": grant["assessment_access_grant_id"],
            "state": grant["status"],
            "usable": access_usability.usable,
        }
        if access_usability.reason:
            access["reason"] = access_usability.reason
        if grant.get("expires_at"):
            access["expires_at"] = grant["expires_at"]

        plan = self.repositories.oia_assessment_plans.find_current_by_assessment(
            tenant_id, oia_assessment_id
        )
        coverage = self.repositories.oia_inspection_items.coverage_for_current_assessment(
            tenant_id, oia_assessment_id
        )
        inspection_coverage = {"available": False}
        if coverage:
            inspection_coverage = {
                "available": True,
                "total_items": coverage["total_items"],
                "counts": {
                    state: len(coverage["coverage_by_state"][state])
                    for state in _COVERAGE_STATES
                },
                "ready_for_observation_analysis": coverage["ready_for_observation_analysis"],
            }

        evidence = self.repositories.oia_evidence_items.list_by_assessment(
            tenant_id, oia_assessment_id
        )
        evidence_types = Counter(item["evidence_type"] for item in evidence)
        evidence_sources = Counter(item["source_system_reference"] for item in evidence)
        evidence_progress = {
            "evidence_count": len(evidence),
            "counts_by_type": [
                {"evidence_type": key, "count": evidence_types[key]}
                for key in sorted(evidence_types)
            ],
            "counts_by_source_system": [
                {"source_system_reference": key, "count": evidence_sources[key]}
                for key in sorted(evidence_sources)
            ],
        }

        current_findings = self.repositories.oia_findings.list_current_by_assessment(
            tenant_id, oia_assessment_id
        )
        finding_summary = self.repositories.oia_findings.summary_by_assessment(
            tenant_id, oia_assessment_id, generated_at
        )
        findings = {
            "current_finding_count": len(current_findings),
            "draft_finding_count": sum(
                finding.get("state") == "DRAFT" for finding in current_findings
            ),
            "final_finding_count": finding_summary["finalized_finding_count"],
            "priority_counts": finding_summary["priority_counts"],
        }
        finding_readiness = None
        if assessment["state"] in {"IN_PROGRESS", "READY_FOR_DELIVERY"}:
            finding_readiness = derive_finding_set_readiness(
                self.repositories, tenant_id, oia_assessment_id
            )
            findings["finding_set_readiness"] = {
                "readiness": finding_readiness["readiness"],
                "reason_codes": list(finding_readiness["reason_codes"]),
            }

        deliveries = self.repositories.oia_findings_deliveries.list_by_assessment(
            tenant_id, oia_assessment_id
        )
        delivery = {"delivery_count": len(deliveries)}
        latest_delivery = deliveries[-1] if deliveries else None
        if latest_delivery:
            delivery.update(
                latest_delivery_id=latest_delivery["oia_findings_delivery_id"],
                latest_delivery_sequence=latest_delivery["delivery_sequence"],
                latest_delivered_at=latest_delivery["delivered_at"],
            )

        conversion_record = self.repositories.oia_conversion_decisions.find_current_by_engagement(
            tenant_id, engagement_id
        )
        conversion = None
        conversion_binding_mismatch = False
        if conversion_record:
            expected_delivery_id = latest_delivery["oia_findings_delivery_id"] if latest_delivery else None
            conversion_binding_mismatch = (
                conversion_record.get("oia_assessment_id") != oia_assessment_id
                or conversion_record.get("oia_findings_delivery_id") != expected_delivery_id
            )
            if not conversion_binding_mismatch:
                conversion = {
                    key: conversion_record[key]
                    for key in (
                        "oia_conversion_decision_id",
                        "decision_version",
                        "oia_findings_delivery_id",
                        "decision",
                        "state",
                    )
                }

        phase5c_progression = self.phase5c.progression(
            tenant_id, engagement_id, generated_at
        )
        next_action = self._next_required_action(
            assessment=assessment,
            plan=plan,
            finding_readiness=finding_readiness,
            conversion=conversion,
            conversion_binding_mismatch=conversion_binding_mismatch,
            phase5c_progression=phase5c_progression,
        )

        result = {
            "tenant_id": tenant_id,
            "engagement_id": engagement_id,
            "oia_assessment_id": oia_assessment_id,
            "engagement_state": engagement["engagement_state"],
            "assessment_state": assessment["state"],
            "assessment_record_version": assessment["record_version"],
            "diagnostic_scope": {
                "diagnostic_scope_id": scope["diagnostic_scope_id"],
                "scope_version": scope["scope_version"],
                "status": scope["status"],
            },
            "assessment_access": access,
            "inspection_coverage": inspection_coverage,
            "evidence_progress": evidence_progress,
            "findings": findings,
            "delivery": delivery,
            "phase5c_progression": phase5c_progression,
            "next_required_action": next_action,
            "implementation_authorized": False,
            "deployment_authorized": False,
            "generated_at": generated_at,
            "read_model_version": 1,
        }
        if plan:
            result["assessment_plan"] = {
                "oia_assessment_plan_id": plan["oia_assessment_plan_id"],
                "plan_version": plan["plan_version"],
                "state": plan["state"],
            }
        if conversion:
            result["conversion"] = conversion
        return result

    @staticmethod
    def _next_required_action(
        *, assessment, plan, finding_readiness, conversion,
        conversion_binding_mismatch, phase5c_progression,
    ):
        state = assessment["state"]
        if state == "IN_PROGRESS":
            if not plan:
                return _action("CREATE_ASSESSMENT_PLAN", "PLAN_MISSING")
            if plan["state"] == "DRAFT":
                return _action("REVIEW_ASSESSMENT_PLAN", "PLAN_DRAFT")
            if plan["state"] == "REVIEWED":
                return _action("APPROVE_ASSESSMENT_PLAN", "PLAN_REVIEWED")
            reasons = list((finding_readiness or {}).get("reason_codes", ()))
            if (finding_readiness or {}).get("readiness") == "READY":
                return _action("MARK_ASSESSMENT_READY_FOR_DELIVERY", "FINDING_SET_READY")
            if reasons == ["NO_FINDINGS"]:
                return _action("DOMAIN_GAP_REQUIRES_DECISION", "NO_FINDINGS")
            if any(reason in reasons for reason in ("UNRESOLVED_FINDING_REVISION", "FINDING_SUPPORT_INVALID")):
                return {
                    "code": "RESOLVE_FINDING_SET",
                    "reason_codes": [
                        reason for reason in reasons
                        if reason in {"UNRESOLVED_FINDING_REVISION", "FINDING_SUPPORT_INVALID"}
                    ],
                }
            return _action(
                "CONTINUE_DIAGNOSTIC_INVESTIGATION",
                "DIAGNOSTIC_INVESTIGATION_UNRESOLVED",
            )

        if state == "READY_FOR_DELIVERY":
            return _action("DELIVER_FINDINGS", "ASSESSMENT_READY_FOR_DELIVERY")

        if conversion_binding_mismatch:
            return _action("DOMAIN_GAP_REQUIRES_DECISION", "CONVERSION_BINDING_MISMATCH")

        if state == "CLOSED" and not conversion:
            return _action("NO_REQUIRED_OIA_ACTION", "ASSESSMENT_CLOSED")

        if state in {"FINDINGS_DELIVERED", "CLOSED"}:
            if not conversion:
                return _action("RECORD_CONVERSION_DECISION", "CONVERSION_MISSING")
            if conversion["state"] == "PENDING_SEKINFRA":
                return _action("RESOLVE_CONVERSION_DECISION", "CONVERSION_PENDING_SEKINFRA")
            if conversion["state"] == "DECLINED":
                return _action("NO_REQUIRED_OIA_ACTION", "CONVERSION_DECLINED")
            if not phase5c_progression["ongoing_agreement_active"]:
                return _action("ESTABLISH_ONGOING_AGREEMENT", "ONGOING_AGREEMENT_INACTIVE")
            if not phase5c_progression["ongoing_commercial_valid"]:
                return _action(
                    "ESTABLISH_ONGOING_COMMERCIAL_AUTHORITY",
                    "ONGOING_COMMERCIAL_INVALID",
                )
            if not phase5c_progression["ongoing_access_usable"]:
                return _action("ESTABLISH_ONGOING_ACCESS", "ONGOING_ACCESS_UNUSABLE")
            return _action("NO_REQUIRED_OIA_ACTION", "ONGOING_AUTHORITY_READY")

        raise ValueError("unsupported OIA assessment state")


def _action(code, *reason_codes):
    return {"code": code, "reason_codes": list(reason_codes)}
