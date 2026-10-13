"""Source-only security gate + opt-in disposable PostgreSQL approval table checks.

This is a review artifact, NOT a hosted deployment authorization. The opt-in
local test creates scratch tables and roles only inside a rolled-back transaction.
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import unittest
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SQL = ROOT / "provider-artifacts/development-data/current/development_data_sekinfra_human_approval_root_owner_reference_v1.sql"
REPOSITORY = ROOT / "src/sekinfra_consulting/postgres.py"
SCOPE_SOURCE = ROOT / "provider-artifacts/development-data/current/development_data_sekinfra_diagnostic_scope_root_owner_reference_v1.sql"
sys.path.insert(0, str(ROOT / "scripts"))
from oia_development_migration_gate import inspect_migrations


def compact(value):
    return re.sub(r"\s+", " ", value.lower())


class HumanApprovalSourceChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = SQL.read_text(encoding="utf-8")
        cls.norm = compact(cls.source)

    def test_exact_development_source_one_inert_table(self):
        self.assertIn("gnuqaefotwgkwurjpyik", self.source)
        self.assertIn("pwlhruwutoitnieactol", self.source)
        self.assertIn("NOT APPLIED", self.source)
        self.assertIn("No retry", self.source)
        self.assertEqual(len(re.findall(r"(?im)^create table public\.", self.source)), 1)
        self.assertEqual(len(re.findall(r"(?im)^create unique index", self.source)), 1)
        self.assertEqual(len(re.findall(r"(?im)^begin;$", self.source)), 1)
        self.assertEqual(len(re.findall(r"(?im)^commit;$", self.source)), 1)
        self.assertEqual(
            self.source.count("create table public.sekinfra_human_approvals ("), 1
        )
        for banned in (
            r"(?im)^create (role|user|function|trigger|policy|extension)\b",
            r"(?im)^grant (select|insert|update|delete|usage|execute)\b",
            r"(?im)^alter table public\.avuhz_",
            r"(?im)^alter table public\.sekinfra_(oia_assessments|diagnostic_scopes)",
            r"(?im)^drop\b",
        ):
            self.assertNotRegex(self.source, banned)

    def test_matches_existing_diagnostic_approval_repository(self):
        repo = REPOSITORY.read_text(encoding="utf-8")
        cls = repo.split("class HumanApprovalPostgresRepository", 1)[1]
        cols = re.search(r'columns="([^"]+)"', cls).group(1).split(",")
        for column in cols:
            self.assertRegex(self.source, rf"(?m)^  {column}\s+")
        insert = re.search(
            r'insert into public\.sekinfra_human_approvals \(([^)]+)\)', cls
        ).group(1).split(",")
        for column in insert:
            self.assertRegex(self.source, rf"(?m)^  {column}\s+")
        self.assertIn("CLIENT_DECISION_AUTHORITY", self.source)
        self.assertIn("SEKINFRA_ENGAGEMENT_AUTHORITY", self.source)
        self.assertIn("CLIENT_AUTHORITY", self.source)
        self.assertIn("SEKINFRA_AUTHORITY", self.source)
        self.assertIn("evidence_reference text\n    check", self.source)
        self.assertIn("expires_at timestamptz", self.source)
        self.assertIn("approving_principal_reference", self.source)
        self.assertIn("approving_organization_reference", self.source)

    def test_share_existing_canonical_tenant_engagement_and_scope(self):
        self.assertIn(
            "foreign key (tenant_id) references public.avuhz_tenant_organizations (tenant_id)",
            self.norm,
        )
        self.assertIn(
            "foreign key (tenant_id,engagement_id) references public.avuhz_engagements (tenant_id,engagement_id)",
            self.norm,
        )
        self.assertIn(
            "foreign key (tenant_id,diagnostic_scope_id,approved_scope_version) references public.sekinfra_diagnostic_scopes ( tenant_id,diagnostic_scope_id,scope_version )",
            self.norm,
        )
        self.assertIn("primary key (tenant_id,approval_id)", self.norm)
        self.assertIn("where status='active'", self.norm)
        self.assertIn("to_regclass('public.sekinfra_human_approvals') is not null", self.norm)
        self.assertIn("to_regclass('public.sekinfra_diagnostic_scopes') is null", self.norm)
        self.assertIn("sekinfra_%' and c.relkind in ('r','p') ) <> 2", self.norm)
        self.assertIn("diagnostic scope unique key drift", self.source)
        self.assertIn("fkey_count<>3", self.norm)
        self.assertNotIn("references public.sekinfra_engagements", self.norm)

    def test_role_binding_and_guardrails_remain_required(self):
        self.assertIn(
            "approval_role='client_decision_authority' and authority_category='client_authority'",
            self.norm,
        )
        self.assertIn(
            "approval_role='sekinfra_engagement_authority' and authority_category='sekinfra_authority'",
            self.norm,
        )
        self.assertIn("status<>'active' or decision='approve'", self.norm)
        self.assertIn("canonical_scope_digest ~ '^sha256:[0-9a-f]{64}$'", self.norm)
        self.assertIn("expires_at is null or expires_at > effective_at", self.norm)
        self.assertIn("unique index sekinfra_human_approvals_one_active_role", self.norm)
        self.assertIn("identity/roles", self.norm)

    def test_transient_permissions_and_forced_rls(self):
        ordered = [
            "do $avuhz_oia_preflight$",
            "grant avuhz_data_migration_service_dev to postgres",
            "with admin false, inherit false, set true",
            "set local role avuhz_data_migration_service_dev;",
            "grant references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements to postgres;",
            "reset role;",
            "create table public.sekinfra_human_approvals",
            "set local role avuhz_data_migration_service_dev;",
            "revoke references (tenant_id, engagement_id)",
            "on table public.avuhz_engagements from postgres;",
            "reset role;",
            "revoke avuhz_data_migration_service_dev",
            "from postgres granted by postgres;",
            "alter table public.sekinfra_human_approvals enable row level security;",
            "alter table public.sekinfra_human_approvals force row level security;",
            "revoke all privileges on table public.sekinfra_human_approvals",
            "do $avuhz_oia_postcondition$",
            "commit;",
        ]
        cursor = 0
        for phrase in ordered:
            pos = self.norm.find(compact(phrase), cursor)
            self.assertGreaterEqual(pos, 0, phrase)
            cursor = pos + len(compact(phrase))
        self.assertIn("temporary_edge_count<>0", self.norm)
        self.assertIn("owner_total_edge_count<>2", self.norm)
        self.assertIn("engagement_acl_reference_count<>0", self.norm)
        self.assertIn("fkey_count<>3", self.norm)
        self.assertIn("active human authority uniqueness missing", self.norm)
        self.assertIn("i.indisunique and i.indisvalid and i.indisready", self.norm)
        self.assertIn("policy_count <> 0", self.norm)
        self.assertIn("from public, anon, authenticated, service_role", self.norm)
        for role in ("avuhz_command_service","avuhz_acquisition_service_dev",
                     "avuhz_data_runtime_service_dev","avuhz_acquisition_runtime_service_dev"):
            self.assertIn(role, self.norm)
        self.assertIn("unintended read or write authority", self.source)

    def test_historical_schema_stays_blocked(self):
        report = inspect_migrations()
        self.assertEqual(report["outcome"], "BLOCKED")
        self.assertFalse(report["approved_hosted_migration"])


@unittest.skipUnless(os.environ.get("SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER"),
                     "Opt-in disposable LOCAL PostgreSQL required")
class HumanApprovalDisposablePostgresTests(unittest.TestCase):
    def test_exact_approval_schema_fk_guards_and_rollback(self):
        # Run actual CREATE TABLE and UNIQUE INDEX DDL in a scratch schema.
        # No data or resources survive the final ROLLBACK.
        db = os.environ["SEKINFRA_OIA_DISPOSABLE_POSTGRES_CONTAINER"]
        sql = SQL.read_text()
        table = re.search(r"(?s)create table public\.sekinfra_human_approvals \(.*?\n\);\n",sql)
        idx = re.search(r"(?s)create unique index sekinfra_human_approvals_one_active_role\n.*?where status='ACTIVE';",sql)
        self.assertIsNotNone(table)
        self.assertIsNotNone(idx)
        slug = uuid.uuid4().hex[:12]
        schema = "human_approval_" + slug
        t = table.group().replace("public.",schema+".")
        i = idx.group().replace("public.",schema+".")
        tenant = "a3000000-0000-4000-8000-000000000002"
        engagement = "b3000000-0000-4000-8000-000000000002"
        scope = "c3000000-0000-4000-8000-000000000002"
        fake = "f3000000-0000-4000-8000-000000000002"
        # The strict FK/active-role/integrity tests are within a disposable
        # transaction and catch errors without leaking client data.
        script = f"""
begin;
create schema {schema};
create table {schema}.avuhz_tenant_organizations (tenant_id uuid primary key);
create table {schema}.avuhz_engagements (
  tenant_id uuid not null, engagement_id uuid not null,
  primary key(tenant_id,engagement_id));
create table {schema}.sekinfra_diagnostic_scopes (
 tenant_id uuid not null, diagnostic_scope_id uuid not null,
 scope_version integer not null, primary key(tenant_id,diagnostic_scope_id),
 unique(tenant_id,diagnostic_scope_id,scope_version));
{t}
{i}
alter table {schema}.sekinfra_human_approvals enable row level security;
alter table {schema}.sekinfra_human_approvals force row level security;
revoke all on table {schema}.sekinfra_human_approvals from public;
insert into {schema}.avuhz_tenant_organizations values ('{tenant}');
insert into {schema}.avuhz_engagements values ('{tenant}','{engagement}');
insert into {schema}.sekinfra_diagnostic_scopes values ('{tenant}','{scope}',1);
insert into {schema}.sekinfra_human_approvals (
 tenant_id,approval_id,engagement_id,diagnostic_scope_id,approved_scope_version,
 approval_role,authority_category,approving_principal_reference,
 approving_organization_reference,canonical_scope_digest,action_set_version,
 decision,status,conditions,effective_at,correlation_id,idempotency_key
) values (
 '{tenant}','{fake}','{engagement}','{scope}',1,
 'CLIENT_DECISION_AUTHORITY','CLIENT_AUTHORITY','principal:synthetic',
 'organization:synthetic','sha256:'||repeat('a',64),1,'APPROVE','ACTIVE',
 '[]'::jsonb,'2030-01-15T12:00:00Z','d3000000-0000-4000-8000-000000000002','synthetic-key'
);
do $negative$
declare
 rejected boolean;
begin
 rejected:=false;
 begin
   insert into {schema}.sekinfra_human_approvals (
     tenant_id,approval_id,engagement_id,diagnostic_scope_id,approved_scope_version,
     approval_role,authority_category,approving_principal_reference,
     approving_organization_reference,canonical_scope_digest,action_set_version,
     decision,status,conditions,effective_at,correlation_id,idempotency_key
   ) select tenant_id,'d3000000-0000-4000-8000-000000000099',engagement_id,
      diagnostic_scope_id,approved_scope_version,approval_role,authority_category,
      approving_principal_reference,approving_organization_reference,
      canonical_scope_digest,action_set_version,decision,status,
      conditions,effective_at,correlation_id,'duplicate-test'
   from {schema}.sekinfra_human_approvals;
 exception when unique_violation then rejected:=true;
 end;
 if not rejected then raise exception 'duplicate ACTIVE human approval accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_human_approvals
    set authority_category='SEKINFRA_AUTHORITY';
 exception when check_violation then rejected:=true;
 end;
 if not rejected then raise exception 'role category mismatch accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_human_approvals
    set approved_scope_version=2;
 exception when foreign_key_violation then rejected:=true;
 end;
 if not rejected then raise exception 'unbound scope version accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_human_approvals
    set decision='REJECT';
 exception when check_violation then rejected:=true;
 end;
 if not rejected then raise exception 'ACTIVE rejection accepted'; end if;
 rejected:=false;
 begin
   update {schema}.sekinfra_human_approvals
    set tenant_id='a3000000-0000-4000-8000-000000000099';
 exception when foreign_key_violation then rejected:=true;
 end;
 if not rejected then raise exception 'cross-tenant row accepted'; end if;
end;
$negative$;
select 'LOCAL_HUMAN_APPROVAL_RLS='||(select relrowsecurity and relforcerowsecurity
 from pg_class where oid='{schema}.sekinfra_human_approvals'::regclass)::text;
select 'LOCAL_HUMAN_APPROVAL_FKS='||(select count(*) from pg_constraint
 where conrelid='{schema}.sekinfra_human_approvals'::regclass
 and contype='f')::text;
select 'LOCAL_HUMAN_APPROVAL_NEGATIVES=passed';
rollback;
"""
        result = subprocess.run(
            ["docker","exec","-i",db,"psql","-X","-U","postgres","-d","postgres",
             "-v","ON_ERROR_STOP=1","-At"],
            input=script.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,
            check=False,timeout=35
        )
        self.assertEqual(result.returncode,0,
                         "LOCAL disposable PostgreSQL schema safety test failed")
        for marker in (b"LOCAL_HUMAN_APPROVAL_RLS=true",
                       b"LOCAL_HUMAN_APPROVAL_FKS=3",
                       b"LOCAL_HUMAN_APPROVAL_NEGATIVES=passed"):
            self.assertIn(marker,result.stdout)
        probe = subprocess.run(
            ["docker","exec",db,"psql","-X","-U","postgres","-d","postgres",
             "-At","-c",f"select to_regnamespace('{schema}') is null;"],
            stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,timeout=20
        )
        self.assertEqual(probe.returncode,0)
        self.assertEqual(probe.stdout.strip(),b"t")


if __name__=="__main__":
    unittest.main()
