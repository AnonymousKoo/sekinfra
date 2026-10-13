"""Fail-closed source gate and disposable PostgreSQL 17 schema proof.

The reviewed artifact is source only, NOT an authorization to modify hosted
Supabase. The opt-in integration test rolls back one scratch transaction.
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import unittest
import uuid
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SQL=ROOT/"provider-artifacts/development-data/current/development_data_sekinfra_diagnostic_agreement_authority_root_owner_reference_v1.sql"
REPO=ROOT/"src/sekinfra_consulting/postgres.py"
INGRESS=ROOT/"src/sekinfra_consulting/commercial_ingress.py"
sys.path.insert(0,str(ROOT/"scripts"))
from oia_development_migration_gate import inspect_migrations

def squish(source):
    return re.sub(r"\s+"," ",source.lower())

class DiagnosticAgreementSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=SQL.read_text()
        cls.norm=squish(cls.source)

    def test_exact_single_inert_resource_not_hosted(self):
        self.assertIn("SOURCE ONLY",self.source)
        self.assertIn("NOT APPLIED",self.source)
        self.assertIn("gnuqaefotwgkwurjpyik",self.source)
        self.assertIn("pwlhruwutoitnieactol",self.source)
        self.assertIn("no retry",self.source)
        self.assertEqual(len(re.findall(r"(?im)^begin;$",self.source)),1)
        self.assertEqual(len(re.findall(r"(?im)^commit;$",self.source)),1)
        self.assertEqual(len(re.findall(r"(?im)^create table public\.",self.source)),1)
        self.assertEqual(self.source.count(
            "create table public.sekinfra_diagnostic_agreement_authorities ("),1)
        for banned in (
            r"(?im)^create (role|user|policy|function|trigger|extension)\b",
            r"(?im)^grant (select|insert|update|delete|usage|execute)\b",
            r"(?im)^alter table public\.avuhz_",
            r"(?im)^alter table public\.sekinfra_(human_approvals|diagnostic_scopes|oia_assessments)",
            r"(?im)^create (unique )?index\b",
            r"(?im)^drop\b",
        ):
            self.assertNotRegex(self.source,banned)

    def test_matches_existing_agreement_postgres_repository(self):
        code=REPO.read_text().split("class DiagnosticAgreementAuthorityPostgresRepository",1)[1]
        repo_cols=re.search(r'columns="([^"]+)"',code).group(1).split(",")
        insert_cols=re.search(
          r'insert into public\.sekinfra_diagnostic_agreement_authorities \(([^)]+)\)',code
        ).group(1).split(",")
        for col in set(repo_cols+insert_cols):
            self.assertRegex(self.source,rf"(?m)^  {col}\s+")
        self.assertIn("DIAGNOSTIC_OIA",self.source)
        self.assertIn("VERIFIED_ACTIVE",self.source)
        self.assertIn("check (ends_at is null or ends_at > effective_at)",self.source)
        self.assertIn("canonical_scope_digest ~ '^sha256:[0-9a-f]{64}$'",self.source)
        self.assertIn("recorded_at >= verified_at",self.source)

    def test_actual_commercial_ingress_gates_are_not_reimplemented(self):
        ingress=INGRESS.read_text()
        for check in (
            "diagnostic_agreement:record",
            'scope.get("status")!="APPROVED"',
            'scope.get("canonical_scope_digest")',
            'scope.get("engagement_id")!=engagement.get("engagement_id")',
            'scope.get("scope_version")!=payload["scope_version"]',
        ):
            self.assertIn(check,ingress)
        self.assertIn("commercial command enforces approved scope",self.norm)
        self.assertIn("payment",self.norm)
        self.assertIn("no policy, runtime role grant",self.norm)

    def test_prior_three_tables_shared_keys_and_exact_state(self):
        for fragment in (
            "to_regclass('public.sekinfra_diagnostic_agreement_authorities') is not null",
            "to_regclass('public.sekinfra_human_approvals') is null",
            "to_regclass('public.sekinfra_diagnostic_scopes') is null",
            "to_regclass('public.sekinfra_oia_assessments') is null",
            "and c.relkind in ('r','p') ) <> 3",
            "scope fk target changed",
            "references public.avuhz_tenant_organizations (tenant_id)",
            "references public.avuhz_engagements (tenant_id, engagement_id)",
            "references public.sekinfra_diagnostic_scopes ( tenant_id, diagnostic_scope_id, scope_version )",
            "primary key (tenant_id, diagnostic_agreement_authority_id)",
            "unique (tenant_id, diagnostic_agreement_authority_id, record_version)",
            "fkey_count<>3",
        ):
            self.assertIn(fragment,self.norm)

    def test_transient_reference_and_membership_retired(self):
        ordered=(
            "do $avuhz_oia_preflight$",
            "grant avuhz_data_migration_service_dev to postgres",
            "with admin false, inherit false, set true",
            "set local role avuhz_data_migration_service_dev;",
            "grant references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements to postgres;",
            "reset role;",
            "create table public.sekinfra_diagnostic_agreement_authorities",
            "set local role avuhz_data_migration_service_dev;",
            "revoke references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements from postgres;",
            "reset role;",
            "revoke avuhz_data_migration_service_dev",
            "from postgres granted by postgres;",
            "alter table public.sekinfra_diagnostic_agreement_authorities enable row level security;",
            "alter table public.sekinfra_diagnostic_agreement_authorities force row level security;",
            "revoke all privileges on table public.sekinfra_diagnostic_agreement_authorities",
            "do $avuhz_oia_postcondition$",
            "commit;",
        )
        cursor=0
        for fragment in ordered:
            i=self.norm.find(squish(fragment),cursor)
            self.assertGreaterEqual(i,0,f"missing/out of order: {fragment}")
            cursor=i+len(squish(fragment))
        self.assertIn("provider_owner_edge_count<>1",self.norm)
        self.assertIn("owner_total_edge_count<>2",self.norm)
        self.assertIn("temporary_edge_count<>0",self.norm)
        self.assertIn("engagement_acl_reference_count<>0",self.norm)
        self.assertIn("has_column_privilege('postgres','public.avuhz_engagements','engagement_id','references')",self.norm)
        self.assertIn("no matching policy",self.norm) if "no matching policy" in self.norm else self.assertIn("no policy",self.norm)
        self.assertIn("policy_count <> 0",self.norm)
        self.assertIn("from public, anon, authenticated, service_role",self.norm)
        for role in ("anon","authenticated","service_role",
                     "avuhz_command_service","avuhz_data_runtime_service_dev"):
            self.assertIn(role,self.norm)

    def test_legacy_local_chain_still_blocked(self):
        report=inspect_migrations()
        self.assertEqual(report["outcome"],"BLOCKED")
        self.assertFalse(report["approved_hosted_migration"])


@unittest.skipUnless(os.environ.get("SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER"),
                     "Explicit disposable LOCAL Postgres container required")
class AgreementRootDisposableTests(unittest.TestCase):
    def test_exact_new_table_constraints_and_transactional_rollback(self):
        db=os.environ["SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER"]
        sql=SQL.read_text()
        definition=re.search(
            r"(?s)create table public\.sekinfra_diagnostic_agreement_authorities \(.*?\n\);\n",
            sql
        )
        self.assertIsNotNone(definition)
        slug=uuid.uuid4().hex[:12]
        schema="oia_agreement_"+slug
        table=definition.group().replace("public.",schema+".")
        tenant="a3000000-0000-4000-8000-000000000002"
        eng="b3000000-0000-4000-8000-000000000002"
        scope="c3000000-0000-4000-8000-000000000002"
        agreement="d3000000-0000-4000-8000-000000000002"
        script=f"""
begin;
create schema {schema};
create table {schema}.avuhz_tenant_organizations(tenant_id uuid primary key);
create table {schema}.avuhz_engagements(
 tenant_id uuid not null,engagement_id uuid not null,
 primary key(tenant_id,engagement_id));
create table {schema}.sekinfra_diagnostic_scopes(
 tenant_id uuid not null,diagnostic_scope_id uuid not null,scope_version integer not null,
 primary key(tenant_id,diagnostic_scope_id),
 unique(tenant_id,diagnostic_scope_id,scope_version));
{table}
alter table {schema}.sekinfra_diagnostic_agreement_authorities enable row level security;
alter table {schema}.sekinfra_diagnostic_agreement_authorities force row level security;
revoke all on table {schema}.sekinfra_diagnostic_agreement_authorities from public;
insert into {schema}.avuhz_tenant_organizations values ('{tenant}');
insert into {schema}.avuhz_engagements values ('{tenant}','{eng}');
insert into {schema}.sekinfra_diagnostic_scopes values ('{tenant}','{scope}',1);
insert into {schema}.sekinfra_diagnostic_agreement_authorities(
 tenant_id,diagnostic_agreement_authority_id,engagement_id,agreement_type,
 agreement_reference,status,diagnostic_scope_id,scope_version,
 canonical_scope_digest,effective_at,verified_at,recorded_at,record_version)
values ('{tenant}','{agreement}','{eng}','DIAGNOSTIC_OIA',
 'opaque:synthetic-test','VERIFIED_ACTIVE','{scope}',1,
 'sha256:'||repeat('a',64),'2030-01-15T10:00:00Z',
 '2030-01-15T12:00:00Z','2030-01-15T12:00:00Z',1);
do $negative$
declare
 rejected boolean;
begin
 rejected:=false;
 begin
   update {schema}.sekinfra_diagnostic_agreement_authorities
    set scope_version=2;
 exception when foreign_key_violation then rejected:=true;
 end;
 if not rejected then raise exception 'unbound scope version accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_diagnostic_agreement_authorities
     set tenant_id='a3000000-0000-4000-8000-000000000099';
 exception when foreign_key_violation then rejected:=true;
 end;
 if not rejected then raise exception 'cross-tenant agreement accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_diagnostic_agreement_authorities
    set canonical_scope_digest='not-a-digest';
 exception when check_violation then rejected:=true;
 end;
 if not rejected then raise exception 'bad scope digest accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_diagnostic_agreement_authorities
    set ends_at='2030-01-14T09:00:00Z';
 exception when check_violation then rejected:=true;
 end;
 if not rejected then raise exception 'agreement term before effective accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_diagnostic_agreement_authorities
    set agreement_type='ONGOING';
 exception when check_violation then rejected:=true;
 end;
 if not rejected then raise exception 'other billing agreement type accepted'; end if;
end;
$negative$;
select 'LOCAL_AGREEMENT_FORCE_RLS='||(select relrowsecurity and relforcerowsecurity
 from pg_class where oid='{schema}.sekinfra_diagnostic_agreement_authorities'::regclass)::text;
select 'LOCAL_AGREEMENT_FK_COUNT='||(select count(*) from pg_constraint
 where conrelid='{schema}.sekinfra_diagnostic_agreement_authorities'::regclass and contype='f')::text;
select 'LOCAL_AGREEMENT_NEGATIVE_CHECKS=passed';
rollback;
"""
        result=subprocess.run(
            ["docker","exec","-i",db,"psql","-X","-U","postgres","-d","postgres",
             "-v","ON_ERROR_STOP=1","-At"],
            input=script.encode(),capture_output=True,timeout=35
        )
        self.assertEqual(result.returncode,0,"Local disposable PostgreSQL rejected agreement DDL")
        for marker in (
            b"LOCAL_AGREEMENT_FORCE_RLS=true",
            b"LOCAL_AGREEMENT_FK_COUNT=3",
            b"LOCAL_AGREEMENT_NEGATIVE_CHECKS=passed"
        ):
            self.assertIn(marker,result.stdout)
        probe=subprocess.run(
            ["docker","exec",db,"psql","-X","-U","postgres","-d","postgres",
             "-At","-c",f"select to_regnamespace('{schema}') is null;"],
            capture_output=True,timeout=15
        )
        self.assertEqual(probe.returncode,0)
        self.assertEqual(probe.stdout.strip(),b"t")


if __name__=="__main__":
    unittest.main()
