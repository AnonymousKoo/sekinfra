"""Read-only, deterministic tests for historical OIA migration deployment gate."""
from __future__ import annotations

import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path

CONSULTING = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(CONSULTING / "scripts"))

from oia_development_migration_gate import (
    MIGRATIONS, OIA_SCHEMA, ONBOARDING, SHADOW, inspect_migrations, main,
)


class OiaDevelopmentMigrationGateTests(unittest.TestCase):
    def test_current_canonical_chain_cannot_be_applied_to_hosted_data(self):
        outcome = inspect_migrations()
        self.assertEqual(outcome["boundary"], "SEKINFRA_REPOSITORY_READ_ONLY")
        self.assertFalse(outcome["approved_hosted_migration"])
        self.assertEqual(outcome["outcome"], "BLOCKED")
        self.assertEqual(outcome["source_migration_count"], 20)
        codes = {
            (finding["code"], finding["migration"])
            for finding in outcome["blocking_findings"]
        }
        self.assertIn(("LOCAL_ONLY_MIGRATION_FORBIDDEN_HOSTED", SHADOW), codes)
        self.assertIn(("PRODUCTION_TARGET_IN_HISTORICAL_CHAIN", ONBOARDING), codes)
        self.assertIn(("OIA_REQUIRES_UNDEPLOYED_SEKINFRA_PREREQUISITES", OIA_SCHEMA), codes)
        # Crucially, Phase 5B and 5C actually enable RLS and apply tenant
        # policies using an explicit FOREACH table-name array. Do not report
        # them as missing same-migration RLS.
        dynamic_false_positives = {
            item["migration"]
            for item in outcome["blocking_findings"]
            if item["code"] == "TABLE_WITHOUT_SAME_CHANGE_RLS"
            and item["migration"] in {
                OIA_SCHEMA, "20260827130000_create_sekinfra_phase5c_durable_schema.sql"
            }
        }
        self.assertEqual(dynamic_false_positives, set())
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(main(["--json"]), 2)

    def test_missing_canonical_sources_are_blocking(self):
        with tempfile.TemporaryDirectory() as folder:
            missing = inspect_migrations(Path(folder))
        self.assertEqual(missing["outcome"], "BLOCKED")
        self.assertIn(
            "REQUIRED_CANONICAL_SOURCE_MISSING",
            {entry["code"] for entry in missing["blocking_findings"]},
        )

    def test_source_only_unrelated_sql_never_proves_provider_readiness(self):
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder) / "test.sql").write_text(
                "CREATE TABLE public.test (tenant_id uuid not null);"
            )
            report = inspect_migrations(Path(folder))
        self.assertNotEqual(report["outcome"], "READY")
        self.assertIn(
            "TABLE_WITHOUT_SAME_CHANGE_RLS",
            {x["code"] for x in report["blocking_findings"]},
        )

    def test_path_cannot_be_symlinked_to_untrusted_directory(self):
        with tempfile.TemporaryDirectory() as folder:
            link = Path(folder) / "migrations"
            link.symlink_to(MIGRATIONS, target_is_directory=True)
            with self.assertRaises(ValueError):
                inspect_migrations(link)


if __name__ == "__main__":
    unittest.main()
