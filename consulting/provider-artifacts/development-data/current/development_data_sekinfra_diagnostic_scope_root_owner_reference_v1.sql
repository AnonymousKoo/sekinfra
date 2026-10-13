-- SOURCE ONLY: diagnostic-scope root v1. NOT APPLIED.
-- Built after successful OIA assessment root v2 on DEVELOPMENT DATA.
-- Scoped temporary owner/REFERENCES procedure retained from the verified
-- Avuhz migration-owner repair. No credential, production, or tenant change.
-- Target, after separate exact approval: Supabase DEVELOPMENT DATA gnuqaefotwgkwurjpyik.
-- NEVER execute on DEVELOPMENT AUTH pwlhruwutoitnieactol, production, or
-- any legacy Sekinfra database. No retry and no implicit follow-on migration.
--
-- Exactly one new Sekinfra diagnostic-scope DOMAIN table. Avuhz owns the
-- existing tenant/engagement authority; no tenant, login,
-- role, session, billing, automation, or credential infrastructure.
--
-- This is an INERT diagnostic scope persistence root, NOT approval or OIA activation.
-- Before any write/read grant or provider adapter, separately establish the
-- verified human approvals, agreement, payment, assessment access grant,
-- guarded command authority, and least-privileged tenant-scoped DB role.
-- No permanent table privileges or RLS policy are granted to a runtime.
-- Forced RLS plus no matching policy denies all non-bypass access.
-- The prior LOCAL-ONLY/PRODUCTION-annotated migration chain is prohibited.

begin;

do $avuhz_oia_preflight$
declare
  migration_role_oid oid;
  postgres_role_oid oid;
  command_role_oid oid;
  provider_owner_edge_count integer;
  owner_total_edge_count integer;
  command_owner_edge_count integer;
begin
  -- PostgreSQL 17 migration caller is NOT a superuser and has no owner SET
  -- membership. This matches the Avuhz sealed migration-owner procedure.
  if session_user <> 'postgres' or current_user <> 'postgres' then
    raise exception 'OIA preflight: exact DEVELOPMENT DATA postgres migration session required';
  end if;
  select oid into strict postgres_role_oid
    from pg_catalog.pg_roles
   where rolname='postgres' and not rolsuper and rolcreaterole;
  select oid into strict migration_role_oid
    from pg_catalog.pg_roles
   where rolname='avuhz_data_migration_service_dev'
     and not rolcanlogin and not rolsuper and not rolinherit
     and not rolcreatedb and not rolcreaterole
     and not rolreplication and not rolbypassrls;
  select oid into strict command_role_oid
    from pg_catalog.pg_roles
   where rolname='avuhz_command_service'
     and not rolcanlogin and not rolsuper and not rolinherit
     and not rolcreatedb and not rolcreaterole
     and not rolreplication and not rolbypassrls;

  select count(*) into provider_owner_edge_count
    from pg_catalog.pg_auth_members m
    join pg_catalog.pg_roles grantor on grantor.oid=m.grantor
   where m.roleid=migration_role_oid and m.member=postgres_role_oid
     and m.admin_option and not m.inherit_option and not m.set_option
     and grantor.rolsuper and m.grantor<>postgres_role_oid;
  select count(*) into command_owner_edge_count
    from pg_catalog.pg_auth_members m
    join pg_catalog.pg_roles grantor on grantor.oid=m.grantor
   where m.roleid=command_role_oid and m.member=migration_role_oid
     and m.admin_option and not m.inherit_option and not m.set_option
     and grantor.rolsuper and m.grantor<>migration_role_oid;
  select count(*) into owner_total_edge_count
    from pg_catalog.pg_auth_members m
   where m.roleid=migration_role_oid or m.member=migration_role_oid;
  if provider_owner_edge_count<>1
     or command_owner_edge_count<>1
     or owner_total_edge_count<>2
     or not pg_catalog.pg_has_role('postgres','avuhz_data_migration_service_dev','MEMBER')
     or pg_catalog.pg_has_role('postgres','avuhz_data_migration_service_dev','SET')
     or pg_catalog.pg_has_role('postgres','avuhz_data_migration_service_dev','USAGE')
     or pg_catalog.pg_has_role('avuhz_data_migration_service_dev','avuhz_command_service','SET')
  then
    raise exception 'OIA preflight: sealed Avuhz migration role membership changed';
  end if;
  if not pg_catalog.has_schema_privilege('postgres','public','CREATE')
     or not pg_catalog.has_table_privilege('postgres','public.avuhz_tenant_organizations','REFERENCES')
     or pg_catalog.has_table_privilege('postgres','public.avuhz_engagements','REFERENCES')
  then
    raise exception 'OIA preflight: scoped FK reference permissions changed';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_class c
    where c.oid='public.avuhz_engagements'::regclass
      and c.relowner=migration_role_oid
  ) then
    raise exception 'OIA preflight: Avuhz engagement owner changed';
  end if;
  if current_database() <> 'postgres' then
    raise exception 'DEVELOPMENT DATA preflight: unexpected database';
  end if;
  if to_regclass('public.avuhz_tenant_organizations') is null
     or to_regclass('public.avuhz_engagements') is null
     or to_regclass('public.avuhz_tenant_owner_memberships') is null
  then
    raise exception 'DEVELOPMENT DATA preflight: shared Avuhz tenant authority missing';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint c
    where c.conrelid = 'public.avuhz_engagements'::regclass
      and c.contype = 'p'
      and pg_catalog.pg_get_constraintdef(c.oid) = 'PRIMARY KEY (tenant_id, engagement_id)'
  ) then
    raise exception 'DEVELOPMENT DATA preflight: Avuhz engagement key changed';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint c
    where c.conrelid = 'public.avuhz_tenant_organizations'::regclass
      and c.contype = 'p'
      and pg_catalog.pg_get_constraintdef(c.oid) = 'PRIMARY KEY (tenant_id)'
  ) then
    raise exception 'DEVELOPMENT DATA preflight: Avuhz tenant authority key changed';
  end if;
  -- Require precisely the prior installed assessment root and no other
  -- vertical tables; this is deliberately NOT a legacy Sekinfra schema replay.
  if to_regclass('public.sekinfra_diagnostic_scopes') is not null
     or to_regclass('public.sekinfra_oia_assessments') is null
     or (
       select count(*) from pg_catalog.pg_class c
        where c.relnamespace='public'::regnamespace
          and c.relname like 'sekinfra_%' and c.relkind in ('r','p')
     ) <> 1
  then
    raise exception 'DEVELOPMENT DATA preflight: previous inert OIA root or scope state mismatch';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_class c
     where c.oid='public.sekinfra_oia_assessments'::regclass
       and c.relowner=postgres_role_oid
       and c.relrowsecurity and c.relforcerowsecurity
  ) or exists (
    select 1 from pg_catalog.pg_policies
    where schemaname='public' and tablename='sekinfra_oia_assessments'
  ) or pg_catalog.has_table_privilege('anon','public.sekinfra_oia_assessments','SELECT')
     or pg_catalog.has_table_privilege('authenticated','public.sekinfra_oia_assessments','SELECT')
     or pg_catalog.has_table_privilege('service_role','public.sekinfra_oia_assessments','SELECT')
  then
    raise exception 'DEVELOPMENT DATA preflight: existing OIA root security changed';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_class c
    where c.oid = 'public.avuhz_engagements'::regclass and c.relrowsecurity
  ) or not exists (
    select 1 from pg_catalog.pg_class c
    where c.oid = 'public.avuhz_tenant_organizations'::regclass
      and c.relrowsecurity and c.relforcerowsecurity
  ) then
    raise exception 'DEVELOPMENT DATA preflight: shared Avuhz RLS changed';
  end if;
end;
$avuhz_oia_preflight$;

-- Exactly one transient role SET edge and one narrowly scoped REFERENCES ACL.
-- Both are revoked in this SAME transaction before commit. A failed statement
-- rolls them all back. PostgreSQL 17's existing sealed role membership and
-- owner ACL are not permanently modified.
grant avuhz_data_migration_service_dev to postgres
  with admin false, inherit false, set true
  granted by current_user;

set local role avuhz_data_migration_service_dev;
grant references (tenant_id, engagement_id)
  on table public.avuhz_engagements to postgres;
reset role;

create table public.sekinfra_diagnostic_scopes (
  tenant_id uuid not null,
  diagnostic_scope_id uuid not null,
  engagement_id uuid not null,
  scope_version integer not null check (scope_version > 0),
  record_version integer not null check (record_version > 0),
  status text not null check (
    status in ('DRAFT','REVIEW_PENDING','APPROVED','REJECTED','SUPERSEDED','CANCELLED')
  ),
  -- Submission is REVIEW_PENDING without a digest. CanonicalizeDiagnosticScope
  -- sets the digest later; an APPROVED scope always requires it.
  canonical_scope_digest text
    check (canonical_scope_digest ~ '^sha256:[0-9a-f]{64}$')
    check (status <> 'APPROVED' or canonical_scope_digest is not null),
  action_set_version integer not null check (action_set_version > 0),
  target_outcome text not null check (char_length(target_outcome) between 1 and 2000),
  in_scope_systems jsonb not null
    check (jsonb_typeof(in_scope_systems)='array'
      and jsonb_array_length(in_scope_systems) between 1 and 20),
  excluded_systems jsonb not null
    check (jsonb_typeof(excluded_systems)='array'
      and jsonb_array_length(excluded_systems) <= 20),
  permitted_actions text[] not null
    check (
      cardinality(permitted_actions) between 1 and 10
      and permitted_actions <@ array[
        'VIEW_CONFIGURATION','VIEW_OPERATIONAL_STATE','VIEW_LOGS',
        'VIEW_METRICS','VIEW_ACCESS_CONFIGURATION','VIEW_NETWORK_CONFIGURATION',
        'VIEW_SECURITY_CONFIGURATION','VIEW_COMPLIANCE_EVIDENCE',
        'NON_DESTRUCTIVE_CONNECTIVITY_TEST','NON_DESTRUCTIVE_PERMISSION_TEST'
      ]::text[]
    ),
  prohibited_actions text[] not null
    check (
      cardinality(prohibited_actions)=10
      and prohibited_actions @> array[
        'CREATE','MODIFY','DELETE','DEPLOY','RESTART','ROTATE',
        'GRANT','REVOKE','CHANGE_CONFIGURATION','PRODUCTION_CHANGE'
      ]::text[]
    ),
  assumptions jsonb not null
    check (jsonb_typeof(assumptions)='array' and jsonb_array_length(assumptions) <= 25),
  constraint_references jsonb not null
    check (jsonb_typeof(constraint_references)='array' and jsonb_array_length(constraint_references) <= 25),
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sekinfra_diagnostic_scopes_pkey
    primary key (tenant_id, diagnostic_scope_id),
  constraint sekinfra_diagnostic_scopes_version_unique
    unique (tenant_id, diagnostic_scope_id, scope_version),
  constraint sekinfra_diagnostic_scopes_avuhz_tenant_fkey
    foreign key (tenant_id)
    references public.avuhz_tenant_organizations (tenant_id),
  constraint sekinfra_diagnostic_scopes_avuhz_engagement_fkey
    foreign key (tenant_id,engagement_id)
    references public.avuhz_engagements (tenant_id,engagement_id)
);

-- Foreign-key creation needed the column grant above. Remove exactly the
-- grant issued by the existing Avuhz table owner before ending the transaction.
set local role avuhz_data_migration_service_dev;
revoke references (tenant_id, engagement_id)
  on table public.avuhz_engagements from postgres;
reset role;

revoke avuhz_data_migration_service_dev
  from postgres granted by postgres;

alter table public.sekinfra_diagnostic_scopes enable row level security;
alter table public.sekinfra_diagnostic_scopes force row level security;

-- Explicitly revoke legacy/default provider exposure after the DDL. A
-- privileged migration owner can still administer the table; no application
-- identity is permitted to read or mutate it until a separately approved
-- Sekinfra domain adapter and fail-closed tenant RLS policy are established.
revoke all privileges on table public.sekinfra_diagnostic_scopes
  from public, anon, authenticated, service_role,
       avuhz_command_service, avuhz_acquisition_service_dev,
       avuhz_data_runtime_service_dev, avuhz_acquisition_runtime_service_dev;

comment on table public.sekinfra_diagnostic_scopes is
  'Sekinfra diagnostic-scope domain persistence, DEVELOPMENT DATA v1. Inert, forced-RLS, no runtime privileges. Avuhz retains sole tenant and engagement authority.';

do $avuhz_oia_postcondition$
declare
  has_rls boolean;
  forced boolean;
  policy_count integer;
  migration_role_oid oid;
  postgres_role_oid oid;
  provider_edge_count integer;
  temporary_edge_count integer;
  owner_total_edge_count integer;
  engagement_acl_reference_count integer;
  fkey_count integer;
begin
  select c.relrowsecurity, c.relforcerowsecurity
    into has_rls, forced
  from pg_catalog.pg_class c
  where c.oid = 'public.sekinfra_diagnostic_scopes'::regclass;
  -- Ensure both temporary authorities are absent again. This transaction
  -- does not rewrite the original owner role or change existing Avuhz ACLs.
  select oid into strict postgres_role_oid
    from pg_catalog.pg_roles where rolname='postgres';
  select oid into strict migration_role_oid
    from pg_catalog.pg_roles where rolname='avuhz_data_migration_service_dev';
  select count(*) into provider_edge_count
    from pg_catalog.pg_auth_members m
    join pg_catalog.pg_roles r on r.oid=m.grantor
   where m.roleid=migration_role_oid and m.member=postgres_role_oid
     and m.admin_option and not m.inherit_option and not m.set_option
     and r.rolsuper and m.grantor<>postgres_role_oid;
  select count(*) into temporary_edge_count
    from pg_catalog.pg_auth_members
   where roleid=migration_role_oid and member=postgres_role_oid
     and grantor=postgres_role_oid;
  select count(*) into owner_total_edge_count
    from pg_catalog.pg_auth_members
   where roleid=migration_role_oid or member=migration_role_oid;
  if provider_edge_count<>1 or temporary_edge_count<>0
     or owner_total_edge_count<>2
     or pg_catalog.pg_has_role('postgres','avuhz_data_migration_service_dev','SET')
     or pg_catalog.pg_has_role('postgres','avuhz_data_migration_service_dev','USAGE')
     or pg_catalog.has_table_privilege('postgres','public.avuhz_engagements','REFERENCES')
     or pg_catalog.has_column_privilege('postgres','public.avuhz_engagements','tenant_id','REFERENCES')
     or pg_catalog.has_column_privilege('postgres','public.avuhz_engagements','engagement_id','REFERENCES')
  then
    raise exception 'OIA postcondition: temporary Avuhz owner REFERENCES authority not retired';
  end if;
  select count(*) into engagement_acl_reference_count
    from pg_catalog.pg_class c
    cross join lateral pg_catalog.aclexplode(
      coalesce(c.relacl,pg_catalog.acldefault('r',c.relowner))
    ) privilege
   where c.oid='public.avuhz_engagements'::regclass
     and privilege.grantee=postgres_role_oid
     and privilege.privilege_type='REFERENCES';
  if engagement_acl_reference_count<>0 then
    raise exception 'OIA postcondition: unexpected lingering Avuhz REFERENCES grant';
  end if;
  select count(*) into fkey_count
    from pg_catalog.pg_constraint c
   where c.conrelid='public.sekinfra_diagnostic_scopes'::regclass
     and c.contype='f'
     and c.conname in (
       'sekinfra_diagnostic_scopes_avuhz_tenant_fkey',
       'sekinfra_diagnostic_scopes_avuhz_engagement_fkey'
     );
  if fkey_count<>2
     or (select c.relowner from pg_catalog.pg_class c
          where c.oid='public.sekinfra_diagnostic_scopes'::regclass) <> postgres_role_oid
  then
    raise exception 'OIA postcondition: tenant FK, engagement FK, or owner changed';
  end if;
  if has_rls is distinct from true or forced is distinct from true then
    raise exception 'OIA postcondition: forced RLS missing';
  end if;
  select count(*) into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public' and tablename = 'sekinfra_diagnostic_scopes';
  if policy_count <> 0 then
    raise exception 'OIA postcondition: unexpected access policy';
  end if;
  if pg_catalog.has_table_privilege('anon', 'public.sekinfra_diagnostic_scopes', 'SELECT')
     or pg_catalog.has_table_privilege('authenticated', 'public.sekinfra_diagnostic_scopes', 'SELECT')
     or pg_catalog.has_table_privilege('service_role', 'public.sekinfra_diagnostic_scopes', 'SELECT')
     or pg_catalog.has_table_privilege('avuhz_command_service', 'public.sekinfra_diagnostic_scopes', 'SELECT')
     or pg_catalog.has_table_privilege('avuhz_command_service', 'public.sekinfra_diagnostic_scopes', 'INSERT')
  then
    raise exception 'OIA postcondition: unintended read or write authority';
  end if;
end;
$avuhz_oia_postcondition$;

commit;
