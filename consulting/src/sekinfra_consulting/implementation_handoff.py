"""Sekinfra adapter for the Sekinfra public ImplementationHandoff v1 contract."""
from __future__ import annotations

import copy
import hashlib
import json
import re


SECRET_FIELD_PARTS = frozenset({
    "credential", "password", "private_key", "secret", "token", "authenticated_url",
})
SECRET_VALUE = re.compile(
    r"(?i)(?:password|passwd|api[_-]?key|access[_-]?token|refresh[_-]?token|"
    r"client[_-]?secret|authorization)\s*[:=]\s*\S+|"
    r"bearer\s+[a-z0-9._~+/=-]{8,}|"
    r"\b(?:https?|postgres(?:ql)?|mysql)://[^\s/:]+:[^\s/@]+@"
)


def canonical_digest(value: dict) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode()
    return "sha256:" + hashlib.sha256(encoded).hexdigest()


def _reject_secret_fields(value, path="handoff"):
    if isinstance(value, dict):
        for key, child in value.items():
            normalized = key.lower().replace("-", "_")
            if any(part in normalized for part in SECRET_FIELD_PARTS):
                raise ValueError(f"secret-bearing field is prohibited at {path}.{key}")
            _reject_secret_fields(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            _reject_secret_fields(child, f"{path}[{index}]")
    elif isinstance(value, str) and SECRET_VALUE.search(value):
        raise ValueError(f"secret-bearing value is prohibited at {path}")


def _finding_key(reference):
    return (
        reference["oia_finding_id"], reference["finding_revision"], reference["content_digest"]
    )


def produce_implementation_handoff(*, outcome, conversion, delivery, findings):
    """Map one exact approved Sekinfra outcome to the public provider-neutral record.

    OIA methodology remains private to Sekinfra. Only opaque source references are
    emitted. The handoff describes approved work and creates no execution authority.
    """
    inputs = [outcome, conversion, delivery, findings]
    _reject_secret_fields(inputs)
    if outcome.get("state") != "APPROVED":
        raise ValueError("Sekinfra implementation outcome must be APPROVED")
    if conversion.get("state") != "ACCEPTED" or conversion.get("decision") != "PROCEED":
        raise ValueError("exact Sekinfra conversion must be accepted PROCEED")
    tenant_id = outcome["tenant_id"]
    engagement_id = outcome["engagement_id"]
    if {conversion["tenant_id"], outcome["tenant_id"]} != {tenant_id}:
        raise ValueError("cross-tenant consulting source is prohibited")
    if conversion["engagement_id"] != engagement_id:
        raise ValueError("consulting engagement binding mismatch")
    if conversion["oia_findings_delivery_id"] != delivery["oia_findings_delivery_id"]:
        raise ValueError("findings delivery identity mismatch")
    if conversion["delivery_sequence"] != delivery["delivery_sequence"]:
        raise ValueError("findings delivery version mismatch")
    if conversion["delivery_manifest_digest"] != delivery["manifest_digest"]:
        raise ValueError("findings delivery digest mismatch")
    if conversion["oia_assessment_id"] != delivery["oia_assessment_id"]:
        raise ValueError("assessment binding mismatch")
    selected = {_finding_key(item) for item in conversion["selected_finding_revisions"]}
    delivered = {_finding_key(item) for item in delivery["finding_revisions"]}
    exact_findings = {
        (item["oia_finding_id"], item["finding_revision"], item["content_digest"]): item
        for item in findings
    }
    if not selected or not selected <= delivered or set(exact_findings) != selected:
        raise ValueError("selected finding identity/version/digest binding mismatch")
    if any(item.get("state") != "FINAL" for item in findings):
        raise ValueError("only FINAL findings may support an implementation handoff")
    version = outcome.get("handoff_version")
    supersedes = outcome.get("supersedes_handoff_reference")
    if not isinstance(version, int) or isinstance(version, bool) or version < 1:
        raise ValueError("handoff version must be a positive integer")
    if version == 1 and supersedes is not None:
        raise ValueError("initial handoff cannot supersede history")
    if version > 1:
        if not isinstance(supersedes, dict) or supersedes.get("reference_type") != "IMPLEMENTATION_HANDOFF":
            raise ValueError("revised handoff must bind prior ImplementationHandoff history")
        if (supersedes.get("reference_id") != outcome["implementation_handoff_id"]
                or supersedes.get("reference_version") != version - 1
                or not isinstance(supersedes.get("reference_digest"), str)
                or not re.fullmatch(r"sha256:[0-9a-f]{64}", supersedes["reference_digest"])):
            raise ValueError("revised handoff predecessor identity/version/digest is invalid")
    approvals = outcome["upstream_approval_references"]
    if (len(approvals) != 2
            or {item["approval_role"] for item in approvals} != {"CLIENT_APPROVER", "PROVIDER_APPROVER"}
            or len({item["approval_reference"] for item in approvals}) != 2):
        raise ValueError("exact separate client and provider approvals are required")
    if outcome["source_conversion_reference"] != {
        "reference_id": conversion["oia_conversion_decision_id"],
        "reference_version": conversion["decision_version"],
        "reference_digest": conversion["conversion_authority_digest"],
    }:
        raise ValueError("approved outcome is not bound to the exact conversion")

    ordered_findings = [exact_findings[key] for key in sorted(exact_findings)]
    handoff = {
        "implementation_handoff_id": outcome["implementation_handoff_id"],
        "tenant_id": tenant_id,
        "client_reference": outcome["client_reference"],
        "source_provider_reference": "provider.sekinfra",
        "source_engagement_reference": engagement_id,
        "handoff_version": outcome["handoff_version"],
        "state": "APPROVED",
        "problem_statement": "\n\n".join(item["verified_operational_problem"] for item in ordered_findings),
        "desired_outcome": "\n\n".join(item["desired_outcome"] for item in ordered_findings),
        "approved_scope": copy.deepcopy(outcome["approved_scope"]),
        "excluded_scope": copy.deepcopy(outcome["excluded_scope"]),
        "constraints": copy.deepcopy(outcome.get("constraints", [])),
        "context_references": copy.deepcopy(outcome.get("context_references", [])),
        "integrations": copy.deepcopy(outcome.get("integrations", [])),
        "allowed_access_level": outcome["allowed_access_level"],
        "risks": copy.deepcopy(outcome.get("risks", [])),
        "implementation_requirements": copy.deepcopy(outcome["implementation_requirements"]),
        "acceptance_criteria": copy.deepcopy(outcome["acceptance_criteria"]),
        "prohibited_changes": copy.deepcopy(outcome["prohibited_changes"]),
        "dependencies": copy.deepcopy(outcome.get("dependencies", [])),
        "assumptions_limitations": copy.deepcopy(outcome.get("assumptions_limitations", [])),
        "upstream_approval_references": copy.deepcopy(approvals),
        "source_artifact_references": [
            {
                "reference_type": "OPAQUE_PROVIDER_ARTIFACT",
                "reference_id": f"sekinfra-finding:{item['oia_finding_id']}",
                "reference_version": item["finding_revision"],
                "reference_digest": item["content_digest"],
            }
            for item in ordered_findings
        ] + [{
            "reference_type": "OPAQUE_PROVIDER_ARTIFACT",
            "reference_id": f"sekinfra-delivery:{delivery['oia_findings_delivery_id']}",
            "reference_version": delivery["delivery_sequence"],
            "reference_digest": delivery["manifest_digest"],
        }],
        "approved_at": outcome["approved_at"],
        "created_at": outcome["created_at"],
    }
    if "supersedes_handoff_reference" in outcome:
        handoff["supersedes_handoff_reference"] = copy.deepcopy(outcome["supersedes_handoff_reference"])
    handoff["handoff_digest"] = canonical_digest(handoff)
    return handoff
