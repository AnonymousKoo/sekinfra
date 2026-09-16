"""Governed Sekinfra ImplementationOutcome authority before public handoff production."""
from __future__ import annotations

import copy

from .implementation_handoff import canonical_digest, produce_implementation_handoff, _reject_secret_fields


OUTCOME_CONTENT_FIELDS = (
    "client_reference", "approved_scope", "excluded_scope", "constraints",
    "context_references", "integrations", "allowed_access_level", "risks",
    "implementation_requirements", "acceptance_criteria", "prohibited_changes",
    "dependencies", "assumptions_limitations",
)


class ImplementationOutcomeRejected(ValueError):
    """Authoritative consulting truth cannot accept the requested outcome action."""


def _finding_key(value):
    return value["oia_finding_id"], value["finding_revision"], value["content_digest"]


def _authority_projection(record):
    return {
        "implementation_outcome_id": record["implementation_outcome_id"],
        "implementation_handoff_id": record["implementation_handoff_id"],
        "tenant_id": record["tenant_id"],
        "engagement_id": record["engagement_id"],
        "outcome_version": record["outcome_version"],
        "handoff_version": record["handoff_version"],
        "source_conversion_reference": copy.deepcopy(record["source_conversion_reference"]),
        "selected_finding_revisions": copy.deepcopy(record["selected_finding_revisions"]),
        **{name: copy.deepcopy(record[name]) for name in OUTCOME_CONTENT_FIELDS},
        "implementation_authority_granted": False,
        "deployment_authority_granted": False,
        **({"supersedes_outcome_reference": copy.deepcopy(record["supersedes_outcome_reference"])} if "supersedes_outcome_reference" in record else {}),
        **({"supersedes_handoff_reference": copy.deepcopy(record["supersedes_handoff_reference"])} if "supersedes_handoff_reference" in record else {}),
    }


def implementation_outcome_authority_digest(record):
    return canonical_digest(_authority_projection(record))


class ImplementationOutcomeHandler:
    def __init__(self, repositories):
        self.repositories = repositories

    @staticmethod
    def _require_sekinfra_or_service(context, capability):
        if context.caller_type == "INTERNAL_SERVICE":
            ImplementationOutcomeHandler._require(context, capability, caller_types=("INTERNAL_SERVICE",))
            return
        if context.caller_type == "HUMAN":
            ImplementationOutcomeHandler._require(
                context, capability, human_role="SEKINFRA_ENGAGEMENT_AUTHORITY", caller_types=("HUMAN",)
            )
            return
        raise ImplementationOutcomeRejected("trusted Sekinfra implementation outcome authority is required")

    @staticmethod
    def _require(context, capability, *, human_role=None, caller_types=("HUMAN", "INTERNAL_SERVICE")):
        if (
            not context.tenant_id
            or context.caller_type not in caller_types
            or capability not in context.capabilities
        ):
            raise ImplementationOutcomeRejected("trusted implementation outcome authority is required")
        if human_role is not None:
            if (
                context.caller_type != "HUMAN"
                or context.human_authority_role != human_role
                or not context.human_principal_reference
                or not context.human_organization_reference
            ):
                raise ImplementationOutcomeRejected("trusted human implementation outcome authority is required")

    def _conversion_sources(self, tenant_id, engagement_id, conversion_id, decision_version):
        conversion = self.repositories.oia_conversion_decisions.get_version(
            tenant_id, conversion_id, decision_version
        )
        current_conversion = self.repositories.oia_conversion_decisions.get_current(tenant_id, conversion_id)
        if (
            not conversion
            or not current_conversion
            or current_conversion.get("decision_version") != decision_version
            or current_conversion.get("conversion_authority_digest") != conversion.get("conversion_authority_digest")
            or conversion.get("engagement_id") != engagement_id
            or conversion.get("state") != "ACCEPTED"
            or conversion.get("decision") != "PROCEED"
            or not conversion.get("selected_finding_revisions")
        ):
            raise ImplementationOutcomeRejected("exact accepted PROCEED conversion is required")
        delivery = self.repositories.oia_findings_deliveries.get(
            tenant_id, conversion["oia_findings_delivery_id"]
        )
        latest_delivery = self.repositories.oia_findings_deliveries.latest_by_assessment(
            tenant_id, conversion.get("oia_assessment_id")
        )
        if (
            not delivery
            or not latest_delivery
            or latest_delivery.get("oia_findings_delivery_id") != delivery.get("oia_findings_delivery_id")
            or latest_delivery.get("delivery_sequence") != delivery.get("delivery_sequence")
            or latest_delivery.get("manifest_digest") != delivery.get("manifest_digest")
            or delivery.get("oia_assessment_id") != conversion.get("oia_assessment_id")
            or delivery.get("delivery_sequence") != conversion.get("delivery_sequence")
            or delivery.get("manifest_digest") != conversion.get("delivery_manifest_digest")
        ):
            raise ImplementationOutcomeRejected("exact governed findings delivery is required")
        delivered = {_finding_key(item) for item in delivery["finding_revisions"]}
        selected = {_finding_key(item) for item in conversion["selected_finding_revisions"]}
        if not selected or not selected <= delivered:
            raise ImplementationOutcomeRejected("conversion selection is not bound to delivered findings")
        findings = []
        for finding_id, revision, digest in sorted(selected):
            finding = self.repositories.oia_findings.get_revision(tenant_id, finding_id, revision)
            current_finding = self.repositories.oia_findings.get(tenant_id, finding_id)
            if (
                not finding
                or current_finding != finding
                or finding.get("state") != "FINAL"
                or finding.get("content_digest") != digest
                or finding.get("oia_assessment_id") != conversion.get("oia_assessment_id")
            ):
                raise ImplementationOutcomeRejected("selected delivered finding is not authoritative")
            findings.append(finding)
        return conversion, delivery, tuple(findings)

    def create_draft(self, context, payload, now):
        self._require_sekinfra_or_service(context, "implementation_outcome:write")
        tenant_id = context.tenant_id
        engagement_id = payload["engagement_id"]
        engagement = self.repositories.engagements.get(tenant_id, engagement_id)
        if not engagement or engagement.get("engagement_state") not in {"OPEN", "ONBOARDING", "ACTIVE"}:
            raise ImplementationOutcomeRejected("active engagement is required")
        conversion, delivery, findings = self._conversion_sources(
            tenant_id, engagement_id, payload["oia_conversion_decision_id"], payload["decision_version"]
        )
        if self.repositories.implementation_outcomes.get_version(
            tenant_id, payload["implementation_outcome_id"], payload["outcome_version"]
        ):
            raise ImplementationOutcomeRejected("implementation outcome version already exists")
        version = payload["outcome_version"]
        prior = self.repositories.implementation_outcomes.get_current(
            tenant_id, payload["implementation_outcome_id"]
        )
        if version == 1:
            if prior or payload.get("supersedes_outcome_reference") or payload.get("supersedes_handoff_reference"):
                raise ImplementationOutcomeRejected("initial outcome cannot supersede prior authority")
        else:
            if not prior or prior.get("state") != "APPROVED" or prior.get("outcome_version") != version - 1:
                raise ImplementationOutcomeRejected("exact prior approved outcome version is required")
            expected = {
                "reference_type": "IMPLEMENTATION_OUTCOME",
                "reference_id": prior["implementation_outcome_id"],
                "reference_version": prior["outcome_version"],
                "reference_digest": prior["outcome_authority_digest"],
            }
            if payload.get("supersedes_outcome_reference") != expected:
                raise ImplementationOutcomeRejected("outcome predecessor binding mismatch")
            prior_handoff = self._build_handoff_from_record(prior)
            expected_handoff = {
                "reference_type": "IMPLEMENTATION_HANDOFF",
                "reference_id": prior_handoff["implementation_handoff_id"],
                "reference_version": prior_handoff["handoff_version"],
                "reference_digest": prior_handoff["handoff_digest"],
            }
            if payload.get("supersedes_handoff_reference") != expected_handoff:
                raise ImplementationOutcomeRejected("handoff predecessor binding mismatch")
        content = {name: copy.deepcopy(payload[name]) for name in OUTCOME_CONTENT_FIELDS}
        _reject_secret_fields(content)
        if content["allowed_access_level"] not in {
            "NO_DIRECT_ACCESS", "READ_ONLY", "SANDBOX_ONLY", "NON_PRODUCTION_BOUNDED"
        }:
            raise ImplementationOutcomeRejected("allowed access level is outside the public handoff contract")
        record = {
            "implementation_outcome_id": payload["implementation_outcome_id"],
            "implementation_handoff_id": payload["implementation_handoff_id"],
            "tenant_id": tenant_id,
            "engagement_id": engagement_id,
            "outcome_version": version,
            "handoff_version": version,
            "record_version": 1,
            "state": "DRAFT",
            "source_conversion_reference": {
                "reference_id": conversion["oia_conversion_decision_id"],
                "reference_version": conversion["decision_version"],
                "reference_digest": conversion["conversion_authority_digest"],
            },
            "selected_finding_revisions": copy.deepcopy(conversion["selected_finding_revisions"]),
            **content,
            "implementation_authority_granted": False,
            "deployment_authority_granted": False,
            "created_at": now,
            "updated_at": now,
        }
        for name in ("supersedes_outcome_reference", "supersedes_handoff_reference"):
            if name in payload:
                record[name] = copy.deepcopy(payload[name])
        record["outcome_authority_digest"] = implementation_outcome_authority_digest(record)
        return self.repositories.implementation_outcomes.create(record)

    def record_approval(self, context, payload, now):
        role = payload["authority_role"]
        if role not in {"CLIENT_DECISION_AUTHORITY", "SEKINFRA_ENGAGEMENT_AUTHORITY"}:
            raise ImplementationOutcomeRejected("unsupported implementation outcome approval role")
        self._require(context, "implementation_outcome:approve", human_role=role, caller_types=("HUMAN",))
        tenant_id = context.tenant_id
        current = self.repositories.implementation_outcomes.get_version(
            tenant_id, payload["implementation_outcome_id"], payload["outcome_version"]
        )
        if not current or current.get("state") != "DRAFT":
            raise ImplementationOutcomeRejected("draft implementation outcome is required")
        if self.repositories.human_approvals.find_active_implementation_outcome_binding(
            tenant_id, current["implementation_outcome_id"], current["outcome_version"],
            current["outcome_authority_digest"], role
        ):
            raise ImplementationOutcomeRejected("duplicate active implementation outcome authority")
        evidence_reference = copy.deepcopy(payload["evidence_reference"])
        _reject_secret_fields(evidence_reference)
        approval = {
            "approval_id": payload["approval_id"],
            "tenant_id": tenant_id,
            "engagement_id": current["engagement_id"],
            "subject_type": "IMPLEMENTATION_OUTCOME",
            "subject_id": current["implementation_outcome_id"],
            "subject_version": current["outcome_version"],
            "approval_category": "IMPLEMENTATION_OUTCOME",
            "authority_category": "CLIENT_AUTHORITY" if role == "CLIENT_DECISION_AUTHORITY" else "SEKINFRA_AUTHORITY",
            "actor_identity": context.human_principal_reference,
            "actor_organization": context.human_organization_reference,
            "actor_role": role,
            "decision": "APPROVE",
            "implementation_outcome_authority": {
                "subject_id": current["implementation_outcome_id"],
                "authority_digest": current["outcome_authority_digest"],
            },
            "conditions": [],
            "effective_at": now,
            "evidence_reference": evidence_reference,
            "status": "ACTIVE",
            "correlation_id": payload["correlation_id"],
            "idempotency_key": payload["idempotency_key"],
            "created_at": now,
        }
        self.repositories.human_approvals.record_implementation_outcome(approval)
        return copy.deepcopy(approval)

    def approve(self, context, payload, now):
        self._require_sekinfra_or_service(context, "implementation_outcome:approve")
        tenant_id = context.tenant_id
        current = self.repositories.implementation_outcomes.get_version(
            tenant_id, payload["implementation_outcome_id"], payload["outcome_version"]
        )
        if not current or current.get("state") != "DRAFT" or current.get("record_version") != payload["expected_record_version"]:
            raise ImplementationOutcomeRejected("current draft implementation outcome is required")
        conversion, _, _ = self._conversion_sources(
            tenant_id, current["engagement_id"],
            current["source_conversion_reference"]["reference_id"],
            current["source_conversion_reference"]["reference_version"],
        )
        if current["source_conversion_reference"]["reference_digest"] != conversion["conversion_authority_digest"]:
            raise ImplementationOutcomeRejected("draft source conversion is stale")
        approvals = []
        for role, public_role in (
            ("CLIENT_DECISION_AUTHORITY", "CLIENT_APPROVER"),
            ("SEKINFRA_ENGAGEMENT_AUTHORITY", "PROVIDER_APPROVER"),
        ):
            approval = self.repositories.human_approvals.find_active_implementation_outcome_binding(
                tenant_id, current["implementation_outcome_id"], current["outcome_version"],
                current["outcome_authority_digest"], role
            )
            if not approval:
                raise ImplementationOutcomeRejected("both exact human implementation outcome approvals are required")
            approvals.append({
                "approval_role": public_role,
                "approval_reference": approval["approval_id"],
                "approved_by": approval["actor_identity"],
                "approved_at": approval["effective_at"],
            })
        return self.repositories.implementation_outcomes.approve(current, approvals, now)

    def revoke(self, context, payload, now):
        self._require(
            context, "implementation_outcome:revoke",
            human_role="SEKINFRA_ENGAGEMENT_AUTHORITY", caller_types=("HUMAN",)
        )
        current = self.repositories.implementation_outcomes.get_version(
            context.tenant_id, payload["implementation_outcome_id"], payload["outcome_version"]
        )
        if not current or current.get("state") != "APPROVED" or current.get("record_version") != payload["expected_record_version"]:
            raise ImplementationOutcomeRejected("current approved implementation outcome is required")
        return self.repositories.implementation_outcomes.revoke(current, payload["reason"], now)

    def _build_handoff_from_record(self, outcome):
        conversion, delivery, findings = self._conversion_sources(
            outcome["tenant_id"], outcome["engagement_id"],
            outcome["source_conversion_reference"]["reference_id"],
            outcome["source_conversion_reference"]["reference_version"],
        )
        return produce_implementation_handoff(
            outcome=outcome, conversion=conversion, delivery=delivery, findings=list(findings)
        )

    def build_handoff(self, context, implementation_outcome_id, outcome_version):
        self._require_sekinfra_or_service(context, "implementation_outcome:approve")
        outcome = self.repositories.implementation_outcomes.get_version(
            context.tenant_id, implementation_outcome_id, outcome_version
        )
        if not outcome or outcome.get("state") != "APPROVED":
            raise ImplementationOutcomeRejected("approved implementation outcome is required")
        return self._build_handoff_from_record(outcome)
