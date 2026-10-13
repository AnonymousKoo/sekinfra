"""Read-only source checks and disposable Postgres 17 schema proof.

Source artifact stays inert. The opt-in DB test creates an isolated schema
inside a transaction and rolls it back; it cannot access hosted Supabase.
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
SQL=ROOT/"provider-artifacts/development-data/current/development_data_sekinfra_diagnostic_scope_root_owner_reference_v1.sql"
POSTGRES_REPOSITORY=ROOT/"src/sekinfra_consulting/postgres.py"
PREVIOUS=ROOT/"provider-artifacts/development-data/current/development_data_sekinfra_oia_assessment_root_owner_reference_v2.sql"
CANONICAL_SCOPE=ROOT/"src/sekinfra_consulting/canonical_scope.py"
sys.path.insert(0,str(ROOT/"scripts"))
from oia_development_migration_gate import inspect_migrations

def normalized(source):
    return re.sub(r"\s+"," ",source.lower())

class DiagnosticScopeRootSourceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source=SQL.read_text(encoding="utf-8")
        cls.norm=normalized(cls.source)

    def test_one_inert_resource_only(self):
        self.assertIn("gnuqaefotwgkwurjpyik",self.source)
        self.assertIn("pwlhruwutoitnieactol",self.source)
        self.assertIn("NOT APPLIED",self.source)
        self.assertIn("No retry",self.source)
        self.assertEqual(len(re.findall(r"(?im)^create table public\.",self.source)),1)
        self.assertEqual(len(re.findall(r"(?im)^begin;$",self.source)),1)
        self.assertEqual(len(re.findall(r"(?im)^commit;$",self.source)),1)
        for regex in [
            r"(?im)^create (role|user|policy|function|trigger|extension)\b",
            r"(?im)^grant (select|insert|update|delete|execute|usage)\b",
            r"(?im)^alter table public\.avuhz_",
            r"(?im)^alter table public\.sekinfra_oia_assessments",
            r"(?im)^drop\b",
        ]:
            self.assertNotRegex(self.source,regex)
        self.assertEqual(self.source.count("create table public.sekinfra_diagnostic_scopes ("),1)

    def test_repository_columns_align_and_preapproval_digest_is_nullable(self):
        repo=POSTGRES_REPOSITORY.read_text(encoding="utf-8")
        columns=re.search(
            r'class DiagnosticScopePostgresRepository.*?columns="([^"]+)"',
            repo,re.S
        ).group(1).split(",")
        columns.append("effective_at")
        for col in columns:
            self.assertRegex(self.source,rf"(?m)^  {col}\s+")
        self.assertIn("status <> 'APPROVED' or canonical_scope_digest is not null",self.source)
        self.assertIn("canonical_scope_digest text\n    check",self.source)
        self.assertIn("REVIEW_PENDING",self.source)
        self.assertIn("set_canonical_scope_digest",repo)
        self.assertIn('"permitted_diagnostic_actions"',CANONICAL_SCOPE.read_text())
        self.assertIn("check (scope_version > 0)",self.source)
        self.assertIn("check (record_version > 0)",self.source)

    def test_parent_and_tenant_keys_stay_with_shared_avuhz(self):
        self.assertIn("primary key (tenant_id, diagnostic_scope_id)",self.norm)
        self.assertIn("unique (tenant_id, diagnostic_scope_id, scope_version)",self.norm)
        self.assertIn("foreign key (tenant_id,engagement_id) references public.avuhz_engagements (tenant_id,engagement_id)",self.norm)
        self.assertIn("foreign key (tenant_id) references public.avuhz_tenant_organizations (tenant_id)",self.norm)
        self.assertNotIn("references public.sekinfra_engagements",self.norm)
        self.assertIn("to_regclass('public.sekinfra_oia_assessments') is null",self.source)
        self.assertIn("existing OIA root security changed",self.source)
        self.assertIn("previous inert OIA root",self.source)
        self.assertIn("sekinfra_oia_assessments'::regclass",self.source)

    def test_permission_grants_exhaustively_reverted_before_commit(self):
        statements=[
            "do $avuhz_oia_preflight$",
            "grant avuhz_data_migration_service_dev to postgres",
            "with admin false, inherit false, set true",
            "set local role avuhz_data_migration_service_dev;",
            "grant references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements to postgres;",
            "reset role;",
            "create table public.sekinfra_diagnostic_scopes",
            "set local role avuhz_data_migration_service_dev;",
            "revoke references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements from postgres;",
            "reset role;",
            "revoke avuhz_data_migration_service_dev",
            "from postgres granted by postgres;",
            "alter table public.sekinfra_diagnostic_scopes enable row level security;",
            "alter table public.sekinfra_diagnostic_scopes force row level security;",
            "revoke all privileges on table public.sekinfra_diagnostic_scopes",
            "do $avuhz_oia_postcondition$",
            "commit;",
        ]
        cursor=0
        for fragment in statements:
            idx=self.norm.find(normalized(fragment),cursor)
            self.assertGreaterEqual(idx,0,"Missing or reordered: "+fragment)
            cursor=idx+len(normalized(fragment))
        self.assertEqual(len(re.findall(r"(?im)^set local role avuhz_data_migration_service_dev;$",self.source)),2)
        self.assertEqual(len(re.findall(r"(?im)^reset role;$",self.source)),2)
        self.assertEqual(len(re.findall(r"(?im)^grant references \(",self.source)),1)
        self.assertEqual(len(re.findall(r"(?im)^revoke references \(",self.source)),1)
        for item in [
            "provider_owner_edge_count<>1","command_owner_edge_count<>1",
            "owner_total_edge_count<>2","temporary_edge_count<>0",
            "engagement_acl_reference_count<>0",
            "has_column_privilege('postgres','public.avuhz_engagements','tenant_id','references')",
            "has_column_privilege('postgres','public.avuhz_engagements','engagement_id','references')",
            "fkey_count<>2",
        ]:
            self.assertIn(item,self.norm)

    def test_force_rls_no_policies_or_runtime_grants(self):
        self.assertIn("enable row level security",self.norm)
        self.assertIn("force row level security",self.norm)
        self.assertIn("policy_count <> 0",self.norm)
        self.assertIn("from public, anon, authenticated, service_role",self.norm)
        for role in [
            "avuhz_command_service","avuhz_acquisition_service_dev",
            "avuhz_data_runtime_service_dev","avuhz_acquisition_runtime_service_dev",
        ]:
            self.assertIn(role,self.norm)
        self.assertIn("unexpected access policy",self.source)
        self.assertIn("unintended read or write authority",self.source)
        self.assertIn("grantor.rolsuper",self.norm)

    def test_prior_security_chain_unchanged_and_not_replayed(self):
        self.assertIn("sekinfra_oia_assessments",PREVIOUS.read_text())
        result=inspect_migrations()
        self.assertEqual(result["outcome"],"BLOCKED")
        self.assertFalse(result["approved_hosted_migration"])

@unittest.skipUnless(os.environ.get("SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER"),
                     "Explicit disposable LOCAL postgres container required")
class DiagnosticScopeRollbackPostgresTests(unittest.TestCase):
    def test_actual_scope_definition_and_constraints_without_persistent_changes(self):
        container=os.environ["SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER"]
        source=SQL.read_text()
        table=re.search(
            r"(?s)create table public\.sekinfra_diagnostic_scopes \(.*?\n\);\n",
            source,
        )
        self.assertIsNotNone(table)
        slug=uuid.uuid4().hex[:12]
        schema="oia_scope_"+slug
        definition=table.group().replace("public.",schema+".")
        # Scratch authoritative parent keys, all isolated in this session.
        psql=f"""
begin;
create schema {schema};
create table {schema}.avuhz_tenant_organizations (tenant_id uuid primary key);
create table {schema}.avuhz_engagements (
 tenant_id uuid not null,engagement_id uuid not null,
 primary key(tenant_id,engagement_id),
 foreign key (tenant_id) references {schema}.avuhz_tenant_organizations(tenant_id));
{definition}
alter table {schema}.sekinfra_diagnostic_scopes enable row level security;
alter table {schema}.sekinfra_diagnostic_scopes force row level security;
revoke all on {schema}.sekinfra_diagnostic_scopes from PUBLIC;
insert into {schema}.avuhz_tenant_organizations values ('a3000000-0000-4000-8000-000000000002');
insert into {schema}.avuhz_engagements values ('a3000000-0000-4000-8000-000000000002','b3000000-0000-4000-8000-000000000002');
insert into {schema}.sekinfra_diagnostic_scopes
(tenant_id,diagnostic_scope_id,engagement_id,scope_version,record_version,status,
 action_set_version,target_outcome,in_scope_systems,excluded_systems,permitted_actions,
 prohibited_actions,assumptions,constraint_references)
values (
 'a3000000-0000-4000-8000-000000000002',
 'c3000000-0000-4000-8000-000000000002',
 'b3000000-0000-4000-8000-000000000002',1,1,'REVIEW_PENDING',1,
 'Synthetic diagnostic review','[{{"reference":"fictional"}}]'::jsonb,'[]'::jsonb,
 ARRAY['VIEW_CONFIGURATION'],ARRAY[
 'CREATE','MODIFY','DELETE','DEPLOY','RESTART','ROTATE','GRANT',
 'REVOKE','CHANGE_CONFIGURATION','PRODUCTION_CHANGE'],
 '[]'::jsonb,'[]'::jsonb
);
select 'LOCAL_SCOPE_INERT_RLS='||(SELECT relrowsecurity AND relforcerowsecurity
    FROM pg_class WHERE oid='{schema}.sekinfra_diagnostic_scopes'::regclass)::text;
select 'LOCAL_SCOPE_PENDING_NULL_DIGEST='||(SELECT canonical_scope_digest is null
    FROM {schema}.sekinfra_diagnostic_scopes)::text;
select 'LOCAL_SCOPE_FK_COUNT='||(select count(*) FROM pg_constraint
    WHERE conrelid='{schema}.sekinfra_diagnostic_scopes'::regclass
      and contype='f')::text;
do $negative_scope$
declare
  rejected boolean;
begin
  -- A scope without an authoritative digest may not be represented as APPROVED.
  rejected:=false;
  begin
    update {schema}.sekinfra_diagnostic_scopes
       set status='APPROVED'
     where diagnostic_scope_id='c3000000-0000-4000-8000-000000000002';
  exception when check_violation then rejected:=true;
  end;
  if not rejected then raise exception 'premature approval was accepted'; end if;
  -- No cross-tenant foreign engagement or tenant ID can be substituted.
  rejected:=false;
  begin
    update {schema}.sekinfra_diagnostic_scopes
       set tenant_id='a3000000-0000-4000-8000-000000000099'
     where diagnostic_scope_id='c3000000-0000-4000-8000-000000000002';
  exception when foreign_key_violation then rejected:=true;
  end;
  if not rejected then raise exception 'cross-tenant foreign key was accepted'; end if;
  -- An incomplete prohibited action set is never a valid diagnostic scope.
  rejected:=false;
  begin
    update {schema}.sekinfra_diagnostic_scopes
       set prohibited_actions=ARRAY['CREATE']
     where diagnostic_scope_id='c3000000-0000-4000-8000-000000000002';
  exception when check_violation then rejected:=true;
  end;
  if not rejected then raise exception 'incomplete prohibited action set accepted'; end if;
end
$negative_scope$;
select 'LOCAL_SCOPE_NEGATIVE_CHECKS=passed';
rollback;
"""
        p=subprocess.run(
            ["docker","exec","-i",container,"psql","-X","-U","postgres","-d","postgres",
             "-v","ON_ERROR_STOP=1","-At"],
            input=psql.encode(),capture_output=True,timeout=30,check=False
        )
        self.assertEqual(p.returncode,0,
            "Disposable PostgreSQL rejected scope table definition; no hosted action.")
        for marker in (b"LOCAL_SCOPE_INERT_RLS=true",
                       b"LOCAL_SCOPE_PENDING_NULL_DIGEST=true",
                       b"LOCAL_SCOPE_FK_COUNT=2",
                       b"LOCAL_SCOPE_NEGATIVE_CHECKS=passed"):
            self.assertIn(marker,p.stdout)
        probe=subprocess.run(
            ["docker","exec",container,"psql","-X","-U","postgres","-d","postgres",
             "-At","-c",f"select to_regnamespace('{schema}') is null;"],
            capture_output=True,timeout=15
        )
        self.assertEqual(probe.stdout.strip(),b"t")

if __name__=="__main__":
    unittest.main()
