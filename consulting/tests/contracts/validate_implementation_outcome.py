#!/usr/bin/env python3
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from sekinfra_consulting.schema_registry import SchemaRegistry

ROOT = Path(__file__).resolve().parents[2]
SCHEMAS = ROOT / "contracts/schemas/v1"
OUTCOME_ID = "urn:sekinfra:schema:contracts:domain:implementation-outcome:v1"
APPROVAL_ID = "urn:sekinfra:schema:contracts:domain:human-approval:v1"


def fail(message):
    print(f"implementation-outcome validation: FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def main():
    registry = SchemaRegistry(SCHEMAS)
    outcome_schema = registry.expanded(OUTCOME_ID)
    approval_schema = registry.expanded(APPROVAL_ID)
    outcome_validator = Draft202012Validator(outcome_schema, format_checker=FormatChecker())
    approval_validator = Draft202012Validator(approval_schema, format_checker=FormatChecker())
    digest = "sha256:" + "a" * 64
    outcome = {
        "implementation_outcome_id":"70000000-0000-4000-8000-000000000001",
        "implementation_handoff_id":"80000000-0000-4000-8000-000000000001",
        "tenant_id":"10000000-0000-4000-8000-000000000001",
        "engagement_id":"60000000-0000-4000-8000-000000000001",
        "outcome_version":1,"handoff_version":1,"record_version":2,"state":"APPROVED",
        "source_conversion_reference":{"reference_id":"50000000-0000-4000-8000-000000000001","reference_version":1,"reference_digest":digest},
        "selected_finding_revisions":[{"oia_finding_id":"20000000-0000-4000-8000-000000000001","finding_revision":1,"content_digest":digest}],
        "client_reference":"client.fictional.operations",
        "approved_scope":[{"scope_item_id":"scope.one","description":"Bounded change.","action_classes":["MODIFY_APPLICATION"],"target_references":[]}],
        "excluded_scope":["Production deployment excluded."],"constraints":[],"context_references":[],"integrations":[],
        "allowed_access_level":"SANDBOX_ONLY","risks":[],
        "implementation_requirements":[{"id":"requirement.one","statement":"Preserve attribution."}],
        "acceptance_criteria":[{"criterion_id":"criterion.one","expected_condition":"Changes are attributable.","evidence_requirement":"Test evidence reference."}],
        "prohibited_changes":["No production deployment."],"dependencies":[],"assumptions_limitations":[],
        "outcome_authority_digest":digest,
        "upstream_approval_references":[
            {"approval_role":"CLIENT_APPROVER","approval_reference":"a1000000-0000-4000-8000-000000000001","approved_by":"human.client","approved_at":"2030-01-15T14:00:00Z"},
            {"approval_role":"PROVIDER_APPROVER","approval_reference":"a2000000-0000-4000-8000-000000000001","approved_by":"human.sekinfra","approved_at":"2030-01-15T14:01:00Z"},
        ],
        "implementation_authority_granted":False,"deployment_authority_granted":False,
        "approved_at":"2030-01-15T14:01:00Z","created_at":"2030-01-15T13:00:00Z","updated_at":"2030-01-15T14:01:00Z",
    }
    if list(outcome_validator.iter_errors(outcome)): fail("approved outcome fixture failed")
    for field, value in (("implementation_authority_granted", True),("deployment_authority_granted", True),("state","UNKNOWN")):
        bad=copy.deepcopy(outcome); bad[field]=value
        if not list(outcome_validator.iter_errors(bad)): fail(f"invalid {field} passed")
    bad=copy.deepcopy(outcome); bad.pop("upstream_approval_references")
    if not list(outcome_validator.iter_errors(bad)): fail("approved outcome without dual approvals passed")
    approval = {
        "approval_id":"a1000000-0000-4000-8000-000000000001","tenant_id":outcome["tenant_id"],"engagement_id":outcome["engagement_id"],
        "subject_type":"IMPLEMENTATION_OUTCOME","subject_id":outcome["implementation_outcome_id"],"subject_version":1,"approval_category":"IMPLEMENTATION_OUTCOME",
        "authority_category":"CLIENT_AUTHORITY","actor_identity":"human.client","actor_organization":"organization.client","actor_role":"CLIENT_DECISION_AUTHORITY",
        "decision":"APPROVE","implementation_outcome_authority":{"subject_id":outcome["implementation_outcome_id"],"authority_digest":digest},"conditions":[],
        "effective_at":"2030-01-15T14:00:00Z","evidence_reference":{"source_system":"fictional-approval","object_type":"SOURCE_RECORD","external_id":"approval-001","environment":"TEST"},
        "status":"ACTIVE","correlation_id":"90000000-0000-4000-8000-000000000001","idempotency_key":"implementation-outcome-approval-001","created_at":"2030-01-15T14:00:00Z",
    }
    if list(approval_validator.iter_errors(approval)): fail("implementation outcome approval fixture failed")
    refs = registry.resolve("urn:sekinfra:schema:contracts:common:references:v1")["$defs"]["internalReferenceType"]["enum"]
    caps = registry.resolve("urn:sekinfra:schema:contracts:identity:capability:v1")["enum"]
    if "IMPLEMENTATION_OUTCOME" not in refs: fail("typed reference vocabulary missing IMPLEMENTATION_OUTCOME")
    if not {"implementation_outcome:write","implementation_outcome:approve","implementation_outcome:revoke"} <= set(caps): fail("capability vocabulary incomplete")
    print(f"implementation-outcome validation: PASS ({len(registry.schema_ids)} unique schema IDs, authority and approval boundaries locked)")


if __name__ == "__main__":
    main()
