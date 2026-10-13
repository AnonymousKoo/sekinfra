"""Fail-closed source review for DEVELOPMENT DATA OIA FK permission correction v2.

This cannot approve a hosted change. Integration test is opt-in and performs
only one PostgreSQL transaction, explicitly ROLLBACK, on a disposable LOCAL
Postgres container; never reuses or modifies the hosted Supabase projects.
"""
from __future__ import annotations

import hashlib
import os
import re
import subprocess
import unittest
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "provider-artifacts" / "development-data" / "current"
V1 = ARTIFACTS / "development_data_sekinfra_oia_assessment_root_v1.sql"
V2 = ARTIFACTS / "development_data_sekinfra_oia_assessment_root_owner_reference_v2.sql"
V1_SHA256 = "27b491bff3fdad3f4e6be802f9777ffc40c8b4e41b31ff778295deee680e9d88"
LOCAL_CONTAINER = os.environ.get("SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER")


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower())


class OiaOwnerCorrectionSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.v1 = V1.read_text(encoding="utf-8")
        cls.v2 = V2.read_text(encoding="utf-8")
        cls.normal = normalize(cls.v2)

    def test_prior_immutable_v1_source_unchanged(self):
        self.assertEqual(hashlib.sha256(V1.read_bytes()).hexdigest(), V1_SHA256)
        table = "create table public.sekinfra_oia_assessments ("
        boundary = "alter table public.sekinfra_oia_assessments enable row level security;"
        self.assertEqual(
            self.v1.split(table, 1)[1].split(boundary, 1)[0].split(
                "\n);\n", 1
            )[0],
            self.v2.split(table, 1)[1].split("\n);\n", 1)[0],
        )
        self.assertEqual(
            self.v1.count("create table public.sekinfra_oia_assessments"), 1
        )
        self.assertEqual(
            self.v2.count("create table public.sekinfra_oia_assessments"), 1
        )
        self.assertIn("Prior v1 failed 42501", self.v2)

    def test_one_transaction_and_no_unapproved_infrastructure(self):
        self.assertEqual(len(re.findall(r"(?im)^begin;$", self.v2)), 1)
        self.assertEqual(len(re.findall(r"(?im)^commit;$", self.v2)), 1)
        self.assertEqual(len(re.findall(r"(?im)^create table\b", self.v2)), 1)
        for forbidden in (
            r"(?im)^create role\b", r"(?im)^alter role\b",
            r"(?im)^create policy\b", r"(?im)^grant select\b",
            r"(?im)^grant insert\b", r"(?im)^grant update\b",
            r"(?im)^create function\b", r"(?im)^create trigger\b",
            r"(?im)^drop table\b", r"(?im)^alter table public\.avuhz_",
        ):
            self.assertNotRegex(self.v2, forbidden)
        self.assertIn("gnuqaefotwgkwurjpyik", self.v2)
        self.assertIn("pwlhruwutoitnieactol", self.v2)
        self.assertIn("NOT APPLIED", self.v2)
        self.assertIn("No retry", self.v2)

    def test_strict_temporary_membership_and_column_references_sequence(self):
        ordered = [
            "do $avuhz_oia_preflight$",
            "grant avuhz_data_migration_service_dev to postgres",
            "with admin false, inherit false, set true",
            "granted by current_user;",
            "set local role avuhz_data_migration_service_dev;",
            "grant references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements to postgres;",
            "reset role;",
            "create table public.sekinfra_oia_assessments",
            "set local role avuhz_data_migration_service_dev;",
            "revoke references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements from postgres;",
            "reset role;",
            "revoke avuhz_data_migration_service_dev",
            "from postgres granted by postgres;",
            "alter table public.sekinfra_oia_assessments enable row level security",
            "alter table public.sekinfra_oia_assessments force row level security",
            "revoke all privileges on table public.sekinfra_oia_assessments",
            "do $avuhz_oia_postcondition$",
            "commit;",
        ]
        cursor = 0
        lowered = self.v2.lower()
        for segment in ordered:
            pos = lowered.find(segment, cursor)
            self.assertGreaterEqual(pos, 0, f"Missing or out-of-order: {segment}")
            cursor = pos + len(segment)
        self.assertEqual(
            len(re.findall(r"(?im)^set local role avuhz_data_migration_service_dev;$", self.v2)), 2
        )
        self.assertEqual(len(re.findall(r"(?im)^reset role;$", self.v2)), 2)
        self.assertEqual(len(re.findall(r"(?im)^grant references \(", self.v2)), 1)
        self.assertEqual(len(re.findall(r"(?im)^revoke references \(", self.v2)), 1)
        self.assertEqual(len(re.findall(
            r"(?im)^grant avuhz_data_migration_service_dev to postgres$", self.v2
        )), 1)

    def test_sealed_owner_preconditions_and_no_persistent_acl(self):
        required = [
            "session_user <> 'postgres' or current_user <> 'postgres'",
            "not rolsuper and rolcreaterole",
            "not rolcanlogin and not rolsuper and not rolinherit",
            "provider_owner_edge_count<>1",
            "command_owner_edge_count<>1",
            "owner_total_edge_count<>2",
            "grantor.rolsuper",
            "not m.set_option",
            "not m.inherit_option",
            "pg_catalog.pg_has_role('postgres','avuhz_data_migration_service_dev','set')",
            "not pg_catalog.has_table_privilege('postgres','public.avuhz_tenant_organizations','references')",
            "pg_catalog.has_table_privilege('postgres','public.avuhz_engagements','references')",
            "c.relowner=migration_role_oid",
            "temporary_edge_count<>0",
            "pg_catalog.has_column_privilege('postgres','public.avuhz_engagements','tenant_id','references')",
            "pg_catalog.has_column_privilege('postgres','public.avuhz_engagements','engagement_id','references')",
            "engagement_acl_reference_count<>0",
            "fkey_count<>2",
        ]
        for fragment in required:
            self.assertIn(fragment, self.normal)

    def test_inert_root_and_original_access_boundaries_preserved(self):
        for fragment in (
            "references public.avuhz_tenant_organizations (tenant_id)",
            "references public.avuhz_engagements (tenant_id,engagement_id)",
            "alter table public.sekinfra_oia_assessments enable row level security",
            "alter table public.sekinfra_oia_assessments force row level security",
            "from public, anon, authenticated, service_role",
            "avuhz_command_service, avuhz_acquisition_service_dev",
            "or pg_catalog.has_table_privilege('service_role', 'public.sekinfra_oia_assessments', 'select')",
            "policy_count <> 0",
            "avuhz_tenant_owner_memberships",
        ):
            self.assertIn(fragment, self.normal)


@unittest.skipUnless(LOCAL_CONTAINER, "explicit disposable LOCAL Postgres container required")
class OiaOwnerCorrectionLocalRollbackTests(unittest.TestCase):
    def test_fk_grant_then_revoke_stays_transactionally_reversible(self):
        # An isolated scratch schema and roles exist ONLY inside this
        # transaction. Even a failure rolls back on connection close.
        # Never execute a hosted DDL statement here.
        slug = uuid.uuid4().hex[:12]
        schema = "oia_local_" + slug
        owner = "oia_parent_" + slug
        executor = "oia_runner_" + slug
        script = f"""
begin;
create schema {schema};
create role {owner} nologin;
create role {executor} nologin;
grant {owner} to postgres with admin false, inherit false, set true granted by current_user;
grant {executor} to postgres with admin false, inherit false, set true granted by current_user;
grant usage,create on schema {schema} to {owner},{executor};
set local role {owner};
create table {schema}.parent (tenant_id uuid not null,
 engagement_id uuid not null, primary key(tenant_id,engagement_id));
grant references (tenant_id,engagement_id)
 on table {schema}.parent to {executor};
reset role;
set local role {executor};
create table {schema}.child (tenant_id uuid not null,
 engagement_id uuid not null,
 foreign key (tenant_id,engagement_id)
 references {schema}.parent(tenant_id,engagement_id));
reset role;
set local role {owner};
revoke references (tenant_id,engagement_id)
 on table {schema}.parent from {executor};
reset role;
do $verify$
begin
 if pg_catalog.has_table_privilege('{executor}','{schema}.parent','REFERENCES')
    or pg_catalog.has_column_privilege('{executor}','{schema}.parent','tenant_id','REFERENCES')
 then
    raise exception 'local FK proof left REFERENCES authority';
 end if;
end $verify$;
select 'LOCAL_OIA_FK_AND_REVOKE_PASSED';
rollback;
"""
        result = subprocess.run(
            [
                "docker", "exec", "-i", LOCAL_CONTAINER,
                "psql", "-X", "-U", "postgres", "-d", "postgres",
                "-v", "ON_ERROR_STOP=1", "-At",
            ],
            input=script.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
            check=False,
        )
        self.assertEqual(result.returncode, 0, "disposable PostgreSQL role/grant/FK smoke failed")
        self.assertIn(b"LOCAL_OIA_FK_AND_REVOKE_PASSED", result.stdout)
        probe = subprocess.run(
            [
                "docker", "exec", LOCAL_CONTAINER,
                "psql", "-X", "-U", "postgres", "-d", "postgres", "-At",
                "-c",
                f"select to_regnamespace('{schema}') is null and "
                f"not exists (select 1 from pg_roles where rolname in ('{owner}','{executor}'));",
            ],
            capture_output=True,
            timeout=15,
            check=False,
        )
        self.assertEqual(probe.returncode, 0)
        self.assertEqual(probe.stdout.strip(), b"t")


if __name__ == "__main__":
    unittest.main()
