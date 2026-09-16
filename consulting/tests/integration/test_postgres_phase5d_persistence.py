"""Local-only Phase 5D PostgreSQL durability and tenant-isolation certification."""
from __future__ import annotations

import copy
import os
import sys
import unittest
from pathlib import Path

import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

ROOT = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT / "src")]

from sekinfra_consulting.guards import TrustedExecutionContext
from sekinfra_consulting.implementation_outcome import implementation_outcome_authority_digest
from sekinfra_consulting.postgres import PostgresStore, PostgresUnitOfWork

DSN = os.environ.get("SEKINFRA_POSTGRES_DSN")
ROLE = "sekinfra_phase5d_rls_test"
RLS_PASSWORD = os.environ.get("SEKINFRA_PHASE5D_RLS_TEST_PASSWORD")


@unittest.skipUnless(DSN and RLS_PASSWORD, "local Phase 5D PostgreSQL DSN and test password are required")
class Phase5DPostgresPersistenceTests(unittest.TestCase):
    TENANT = "10000000-0000-4000-8000-000000000001"
    OTHER_TENANT = "10000000-0000-4000-8000-000000000099"
    ENGAGEMENT = "60000000-0000-4000-8000-000000000001"
    CONVERSION = "50000000-0000-4000-8000-000000000001"
    OUTCOME = "70000000-0000-4000-8000-000000000001"
    HANDOFF = "80000000-0000-4000-8000-000000000001"
    NOW = "2030-01-15T14:00:00Z"

    @classmethod
    def owner(cls, *, autocommit=False):
        return psycopg.connect(DSN, autocommit=autocommit, row_factory=dict_row)

    @classmethod
    def setUpClass(cls):
        with cls.owner(autocommit=True) as connection:
            connection.execute(sql.SQL("drop role if exists {}").format(sql.Identifier(ROLE)))
            connection.execute(sql.SQL(
                "create role {} login password {} nosuperuser nobypassrls nocreatedb nocreaterole noinherit"
            ).format(sql.Identifier(ROLE), sql.Literal(RLS_PASSWORD)))
            connection.execute(sql.SQL("grant sekinfra_consulting_service to {}").format(sql.Identifier(ROLE)))

    @classmethod
    def tearDownClass(cls):
        with cls.owner(autocommit=True) as connection:
            connection.execute(sql.SQL("drop role if exists {}").format(sql.Identifier(ROLE)))

    @classmethod
    def service_factory(cls):
        connection = psycopg.connect(
            DSN, user=ROLE, password=RLS_PASSWORD, autocommit=True, row_factory=dict_row
        )
        connection.execute("set role sekinfra_consulting_service")
        return connection

    def context(self, tenant=None):
        return TrustedExecutionContext(
            True, "service:phase5d-test", "INTERNAL_SERVICE", tenant or self.TENANT, None,
            frozenset({"implementation_outcome:write"}), frozenset(), "TEST",
            "sekinfra-consulting-api", "SERVICE", True, self.NOW,
        )

    def setUp(self):
        with self.owner() as connection:
            connection.execute(
                "truncate public.sekinfra_implementation_outcomes,public.sekinfra_human_approvals,"
                "public.sekinfra_oia_conversion_decisions,public.sekinfra_engagements cascade"
            )
            connection.execute("set session_replication_role=replica")
            connection.execute(
                "insert into public.sekinfra_engagements "
                "(engagement_id,tenant_id,acquisition_handoff_id,acquisition_handoff_version,"
                "account_reference,acquisition_opportunity_reference,engagement_type,engagement_state,"
                "engagement_version,record_version,opened_at) values (%s,%s,%s,1,'account.test',"
                "'opportunity.test','DIAGNOSTIC_OIA','OPEN',1,1,%s)",
                (self.ENGAGEMENT, self.TENANT, "61000000-0000-4000-8000-000000000001", self.NOW),
            )
            conversion = {
                "tenant_id": self.TENANT,
                "oia_conversion_decision_id": self.CONVERSION,
                "decision_version": 1,
                "state": "ACCEPTED",
                "record_version": 1,
            }
            connection.execute(
                "insert into public.sekinfra_oia_conversion_decisions "
                "(tenant_id,oia_conversion_decision_id,decision_version,engagement_id,oia_assessment_id,"
                "oia_findings_delivery_id,state,record_version,record,created_at,updated_at) "
                "values (%s,%s,1,%s,%s,%s,'ACCEPTED',1,%s,%s,%s)",
                (self.TENANT, self.CONVERSION, self.ENGAGEMENT,
                 "30000000-0000-4000-8000-000000000001",
                 "40000000-0000-4000-8000-000000000001", Jsonb(conversion), self.NOW, self.NOW),
            )
            connection.execute("set session_replication_role=origin")

    def tearDown(self):
        with self.owner() as connection:
            connection.execute(
                "truncate public.sekinfra_implementation_outcomes,public.sekinfra_human_approvals,"
                "public.sekinfra_oia_conversion_decisions,public.sekinfra_engagements cascade"
            )

    def record(self):
        finding_digest = "sha256:" + "1" * 64
        record = {
            "implementation_outcome_id": self.OUTCOME,
            "implementation_handoff_id": self.HANDOFF,
            "tenant_id": self.TENANT,
            "engagement_id": self.ENGAGEMENT,
            "outcome_version": 1,
            "handoff_version": 1,
            "record_version": 1,
            "state": "DRAFT",
            "source_conversion_reference": {
                "reference_id": self.CONVERSION,
                "reference_version": 1,
                "reference_digest": "sha256:" + "3" * 64,
            },
            "selected_finding_revisions": [{
                "oia_finding_id": "20000000-0000-4000-8000-000000000001",
                "finding_revision": 2,
                "content_digest": finding_digest,
            }],
            "client_reference": "client.fictional.operations",
            "approved_scope": [],
            "excluded_scope": ["Production deployment is excluded."],
            "constraints": ["Preserve existing client records."],
            "context_references": [],
            "integrations": [],
            "allowed_access_level": "SANDBOX_ONLY",
            "risks": [],
            "implementation_requirements": [],
            "acceptance_criteria": [],
            "prohibited_changes": ["No production credential access."],
            "dependencies": [],
            "assumptions_limitations": [],
            "implementation_authority_granted": False,
            "deployment_authority_granted": False,
            "created_at": self.NOW,
            "updated_at": self.NOW,
        }
        record["outcome_authority_digest"] = implementation_outcome_authority_digest(record)
        return record

    def test_outcome_roundtrip_transitions_and_tenant_isolation(self):
        record = self.record()
        uow = PostgresUnitOfWork(PostgresStore(self.service_factory), self.context())
        try:
            self.assertEqual(uow.implementation_outcomes.create(record), record)
            uow.commit()
        finally:
            uow.close()

        fresh = PostgresUnitOfWork(PostgresStore(self.service_factory), self.context())
        try:
            current = fresh.implementation_outcomes.get_version(self.TENANT, self.OUTCOME, 1)
            self.assertEqual(current, record)
            approved = fresh.implementation_outcomes.approve(
                current,
                [{"approval_role": "CLIENT_APPROVER", "approval_reference": "approval.client",
                  "approved_by": "human.client", "approved_at": self.NOW}],
                self.NOW,
            )
            self.assertEqual((approved["state"], approved["record_version"]), ("APPROVED", 2))
            fresh.commit()
        finally:
            fresh.close()

        other = PostgresUnitOfWork(PostgresStore(self.service_factory), self.context(self.OTHER_TENANT))
        try:
            self.assertIsNone(other.implementation_outcomes.get_version(self.TENANT, self.OUTCOME, 1))
        finally:
            other.rollback(); other.close()

        final = PostgresUnitOfWork(PostgresStore(self.service_factory), self.context())
        try:
            current = final.implementation_outcomes.get_version(self.TENANT, self.OUTCOME, 1)
            revoked = final.implementation_outcomes.revoke(current, "Client withdrew implementation intent.", self.NOW)
            self.assertEqual((revoked["state"], revoked["record_version"]), ("REVOKED", 3))
            final.commit()
        finally:
            final.close()

    def test_implementation_outcome_approval_binding_is_durable(self):
        record = self.record()
        uow = PostgresUnitOfWork(PostgresStore(self.service_factory), self.context())
        try:
            uow.implementation_outcomes.create(record)
            approval = {
                "approval_id": "a1000000-0000-4000-8000-000000000001",
                "tenant_id": self.TENANT,
                "engagement_id": self.ENGAGEMENT,
                "subject_type": "IMPLEMENTATION_OUTCOME",
                "subject_id": self.OUTCOME,
                "subject_version": 1,
                "approval_category": "IMPLEMENTATION_OUTCOME",
                "authority_category": "CLIENT_AUTHORITY",
                "actor_identity": "human:client_decision_authority",
                "actor_organization": "organization.client",
                "actor_role": "CLIENT_DECISION_AUTHORITY",
                "decision": "APPROVE",
                "implementation_outcome_authority": {
                    "subject_id": self.OUTCOME,
                    "authority_digest": record["outcome_authority_digest"],
                },
                "conditions": [],
                "effective_at": self.NOW,
                "evidence_reference": {
                    "source_system": "fictional-approval",
                    "object_type": "SOURCE_RECORD",
                    "external_id": "approval.client",
                    "environment": "TEST",
                },
                "status": "ACTIVE",
                "correlation_id": "90000000-0000-4000-8000-000000000001",
                "idempotency_key": "phase5d-approval-client-1",
                "created_at": self.NOW,
            }
            uow.human_approvals.record_implementation_outcome(approval)
            uow.commit()
        finally:
            uow.close()

        fresh = PostgresUnitOfWork(PostgresStore(self.service_factory), self.context())
        try:
            stored = fresh.human_approvals.find_active_implementation_outcome_binding(
                self.TENANT, self.OUTCOME, 1, record["outcome_authority_digest"],
                "CLIENT_DECISION_AUTHORITY",
            )
            self.assertEqual(stored, approval)
            self.assertEqual(fresh.human_approvals.get(self.TENANT, approval["approval_id"]), approval)
        finally:
            fresh.rollback(); fresh.close()


if __name__ == "__main__":
    unittest.main()
