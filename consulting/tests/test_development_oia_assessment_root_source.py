"""Source-only regression checks for one inert DEVELOPMENT DATA OIA table.

These deliberately cannot certify the provider's schema or grant DDL authority.
They prevent accidental widening in the review artifact; live provider
postconditions need a separately approved, independently verified operation.
"""
from __future__ import annotations

import hashlib
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SQL_PATH = (
    ROOT / "provider-artifacts" / "development-data" / "current"
    / "development_data_sekinfra_oia_assessment_root_v1.sql"
)
sys.path.insert(0, str(ROOT / "scripts"))

from oia_development_migration_gate import inspect_migrations

NORMALIZED = lambda value: re.sub(r"\s+", " ", value.lower())


class DevelopmentOiaAssessmentRootSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.raw = SQL_PATH.read_bytes()
        cls.sql = cls.raw.decode("utf-8")
        cls.normalized = NORMALIZED(cls.sql)

    def test_explicit_single_resource_exact_development_data_boundary(self):
        self.assertIn("gnuqaefotwgkwurjpyik", self.sql)
        self.assertIn("pwlhruwutoitnieactol", self.sql)
        self.assertIn("NEVER execute", self.sql)
        self.assertEqual(len(re.findall(
            r"(?im)^\s*create\s+table\s+", self.sql
        )), 1)
        self.assertEqual(len(re.findall(
            r"(?im)^\s*create\s+table\s+public\.sekinfra_oia_assessments",
            self.sql,
        )), 1)
        self.assertEqual(len(re.findall(
            r"(?im)^\s*create\s+role\b|\balter\s+role\b|\bcreate\s+user\b",
            self.sql,
        )), 0)
        self.assertEqual(len(re.findall(r"(?im)^\s*create\s+policy\b", self.sql)), 0)
        self.assertEqual(len(re.findall(r"(?im)^\s*grant\b", self.sql)), 0)
        self.assertRegex(self.sql, r"(?im)^\s*begin;")
        self.assertRegex(self.sql, r"(?im)^\s*commit;")
        self.assertRegex(self.sql, r"(?im)^\s*do \$avuhz_oia_preflight\$")
        self.assertRegex(self.sql, r"(?im)^\s*do \$avuhz_oia_postcondition\$")
        self.assertEqual(len(self.raw), SQL_PATH.stat().st_size)
        self.assertEqual(len(hashlib.sha256(self.raw).hexdigest()), 64)

    def test_reuse_existing_tenant_engagement_authority_only(self):
        self.assertIn(
            "foreign key (tenant_id) references public.avuhz_tenant_organizations (tenant_id)",
            self.normalized,
        )
        self.assertIn(
            "foreign key (tenant_id,engagement_id) references public.avuhz_engagements (tenant_id,engagement_id)",
            self.normalized,
        )
        self.assertIn("primary key (tenant_id, oia_assessment_id)", self.normalized)
        self.assertIn("unique (tenant_id, assessment_access_grant_id)", self.normalized)
        self.assertIn("existing sekinfra resources or replay", self.normalized)
        self.assertIn("shared avuhz rls changed", self.normalized)
        self.assertNotIn("references public.sekinfra_", self.normalized)

    def test_runtime_postgres_assessment_write_contract_matches_columns(self):
        runtime = (ROOT / "src" / "sekinfra_consulting" / "postgres_oia.py").read_text()
        expected = [
            "tenant_id", "oia_assessment_id", "engagement_id",
            "diagnostic_scope_id", "diagnostic_scope_version",
            "assessment_access_grant_id", "state", "record_version",
            "record", "created_at", "updated_at",
        ]
        match = re.search(
            r'"\((tenant_id,oia_assessment_id,[a-z_,]+)\) "', runtime
        )
        self.assertIsNotNone(match)
        self.assertEqual(expected, match.group(1).split(","))
        for column in expected:
            self.assertRegex(self.sql, rf"\b{column}\s+")
        self.assertIn("record->>'tenant_id' = tenant_id::text", self.sql)
        self.assertIn("record->>'assessment_access_grant_id' = assessment_access_grant_id::text", self.sql)
        self.assertIn(") is true)", self.normalized)

    def test_fail_closed_for_all_runtime_roles_and_provider_defaults(self):
        self.assertIn(
            "alter table public.sekinfra_oia_assessments enable row level security",
            self.normalized,
        )
        self.assertIn(
            "alter table public.sekinfra_oia_assessments force row level security",
            self.normalized,
        )
        for role in (
            "public", "anon", "authenticated", "service_role",
            "avuhz_command_service", "avuhz_acquisition_service_dev",
            "avuhz_data_runtime_service_dev", "avuhz_acquisition_runtime_service_dev",
        ):
            self.assertRegex(
                self.sql, rf"\b{re.escape(role)}\b"
            )
        self.assertIn("revoke all privileges on table public.sekinfra_oia_assessments", self.normalized)
        self.assertIn("unexpected access policy", self.sql)
        self.assertIn("unintended read or write authority", self.sql)
        self.assertNotRegex(self.sql, r"(?im)^\s*create\s+function\b")
        self.assertNotRegex(self.sql, r"(?im)^\s*create\s+trigger\b")

    def test_historical_migration_chain_remains_explicitly_blocked(self):
        report = inspect_migrations()
        self.assertEqual(report["outcome"], "BLOCKED")
        self.assertFalse(report["approved_hosted_migration"])
        self.assertTrue(
            any(finding["code"] == "LOCAL_ONLY_MIGRATION_FORBIDDEN_HOSTED"
                for finding in report["blocking_findings"])
        )


if __name__ == "__main__":
    unittest.main()
