-- SOURCE ONLY: diagnostic agreement authority root v1. NOT APPLIED.
-- Separately approved future target: Supabase DEVELOPMENT DATA gnuqaefotwgkwurjpyik.
-- NEVER DEVELOPMENT AUTH pwlhruwutoitnieactol, production, or legacy Sekinfra.
-- One table, single transaction, no retry, no implicit next migration.
-- This persists a provider-neutral agreement verification RECORD ONLY:
-- not a signed document, payment, customer identity, billing service, access
-- authorization, automation, or approval of diagnostic work.
-- Trusted commercial command enforces approved scope, digest, tenant,
-- engagement and caller capability; this table cannot by itself prove
-- those runtime facts. No policy, runtime role grant, or customer data.
-- Existing Avuhz sealed migration-owner temporary REFERENCES procedure:
-- both scoped privileges must be revoked in the same transaction.

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
  -- Exactly three previous inert DOMAIN tables and no agreement table.
  if to_regclass('public.sekinfra_diagnostic_agreement_authorities') is not null
     or to_regclass('public.sekinfra_human_approvals') is null
     or to_regclass('public.sekinfra_diagnostic_scopes') is null
     or to_regclass('public.sekinfra_oia_assessments') is null
     or (
       select count(*) from pg_catalog.pg_class c
        where c.relnamespace='public'::regnamespace
          and c.relname like 'sekinfra_%' and c.relkind in ('r','p')
     ) <> 3
  then
    raise exception 'DEVELOPMENT DATA preflight: expected three inert OIA tables, no diagnostic agreement';
  end if;
  if exists (
    select 1 from pg_catalog.pg_class c
    where c.oid in (
      'public.sekinfra_oia_assessments'::regclass,
      'public.sekinfra_diagnostic_scopes'::regclass,
      'public.sekinfra_human_approvals'::regclass
    ) and (
      c.relowner<>postgres_role_oid
      or not c.relrowsecurity or not c.relforcerowsecurity
    )
  ) or exists (
    select 1 from pg_catalog.pg_policies
    where schemaname='public'
      and tablename in ('sekinfra_oia_assessments',
                        'sekinfra_diagnostic_scopes',
                        'sekinfra_human_approvals')
  ) then
    raise exception 'DEVELOPMENT DATA preflight: existing OIA table RLS drift';
  end if;
  if exists (
    select 1
    from (values ('anon'),('authenticated'),('service_role'),
                 ('avuhz_command_service'),('avuhz_acquisition_service_dev'),
                 ('avuhz_data_runtime_service_dev'),
                 ('avuhz_acquisition_runtime_service_dev')) r(role_name)
    cross join (values ('sekinfra_oia_assessments'),
                       ('sekinfra_diagnostic_scopes'),
                       ('sekinfra_human_approvals')) t(table_name)
    where pg_catalog.has_table_privilege(
      r.role_name, 'public.'||t.table_name, 'SELECT,INSERT,UPDATE,DELETE'
    )
  ) then
    raise exception 'DEVELOPMENT DATA preflight: prior OIA runtime grants drift';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint c
    where c.conrelid='public.sekinfra_diagnostic_scopes'::regclass
      and c.contype='u'
      and pg_catalog.pg_get_constraintdef(c.oid)
        = 'UNIQUE (tenant_id, diagnostic_scope_id, scope_version)'
  ) then
    raise exception 'DEVELOPMENT DATA preflight: scope FK target changed';
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

create table public.sekinfra_diagnostic_agreement_authorities (
  tenant_id uuid not null,
  diagnostic_agreement_authority_id uuid not null,
  engagement_id uuid not null,
  agreement_type text not null check (agreement_type='DIAGNOSTIC_OIA'),
  -- Opaque agreement reference; no raw document, customer PII or signature.
  agreement_reference text not null
    check (char_length(agreement_reference) between 1 and 200),
  status text not null check (
    status in ('VERIFIED_ACTIVE','EXPIRED','REVOKED','SUPERSEDED')
  ),
  diagnostic_scope_id uuid not null,
  scope_version integer not null check (scope_version > 0),
  canonical_scope_digest text not null
    check (canonical_scope_digest ~ '^sha256:[0-9a-f]{64}$'),
  effective_at timestamptz not null,
  ends_at timestamptz,
  verified_at timestamptz not null,
  recorded_at timestamptz not null,
  record_version integer not null check (record_version > 0),
  created_at timestamptz not null default now(),
  constraint sekinfra_diagnostic_agreement_authorities_pkey
    primary key (tenant_id, diagnostic_agreement_authority_id),
  constraint sekinfra_diagnostic_agreement_authorities_version_unique
    unique (tenant_id, diagnostic_agreement_authority_id, record_version),
  constraint sekinfra_diagnostic_agreement_authorities_term_check
    check (ends_at is null or ends_at > effective_at),
  constraint sekinfra_diagnostic_agreement_authorities_verified_recorded_check
    check (recorded_at >= verified_at),
  constraint sekinfra_diagnostic_agreement_authorities_tenant_fkey
    foreign key (tenant_id)
    references public.avuhz_tenant_organizations (tenant_id),
  constraint sekinfra_diagnostic_agreement_authorities_engagement_fkey
    foreign key (tenant_id, engagement_id)
    references public.avuhz_engagements (tenant_id, engagement_id),
  constraint sekinfra_diagnostic_agreement_authorities_scope_fkey
    foreign key (tenant_id, diagnostic_scope_id, scope_version)
    references public.sekinfra_diagnostic_scopes (
      tenant_id, diagnostic_scope_id, scope_version
    )
);

-- Foreign-key creation needed the column grant above. Remove exactly the
-- grant issued by the existing Avuhz table owner before ending the transaction.
set local role avuhz_data_migration_service_dev;
revoke references (tenant_id, engagement_id)
  on table public.avuhz_engagements from postgres;
reset role;

revoke avuhz_data_migration_service_dev
  from postgres granted by postgres;

alter table public.sekinfra_diagnostic_agreement_authorities enable row level security;
alter table public.sekinfra_diagnostic_agreement_authorities force row level security;

-- Explicitly revoke legacy/default provider exposure after the DDL. A
-- privileged migration owner can still administer the table; no application
-- identity is permitted to read or mutate it until a separately approved
-- Sekinfra domain adapter and fail-closed tenant RLS policy are established.
revoke all privileges on table public.sekinfra_diagnostic_agreement_authorities
  from public, anon, authenticated, service_role,
       avuhz_command_service, avuhz_acquisition_service_dev,
       avuhz_data_runtime_service_dev, avuhz_acquisition_runtime_service_dev;

comment on table public.sekinfra_diagnostic_agreement_authorities is
  'Sekinfra diagnostic agreement authority evidence, DEVELOPMENT DATA v1. Inert, forced-RLS, no runtime privileges. Shared Avuhz retains tenant and engagement authority.';

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
  where c.oid = 'public.sekinfra_diagnostic_agreement_authorities'::regclass;
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
   where c.conrelid='public.sekinfra_diagnostic_agreement_authorities'::regclass
     and c.contype='f'
     and c.conname in (
       'sekinfra_diagnostic_agreement_authorities_tenant_fkey',
       'sekinfra_diagnostic_agreement_authorities_engagement_fkey',
       'sekinfra_diagnostic_agreement_authorities_scope_fkey'
     );
  if fkey_count<>3
     or (select c.relowner from pg_catalog.pg_class c
          where c.oid='public.sekinfra_diagnostic_agreement_authorities'::regclass) <> postgres_role_oid
  then
    raise exception 'OIA postcondition: agreement tenant, engagement, scope FKs or owner changed';
  end if;
  if has_rls is distinct from true or forced is distinct from true then
    raise exception 'OIA postcondition: forced RLS missing';
  end if;
  select count(*) into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public' and tablename = 'sekinfra_diagnostic_agreement_authorities';
  if policy_count <> 0 then
    raise exception 'OIA postcondition: unexpected access policy';
  end if;
  if pg_catalog.has_table_privilege('anon', 'public.sekinfra_diagnostic_agreement_authorities', 'SELECT')
     or pg_catalog.has_table_privilege('authenticated', 'public.sekinfra_diagnostic_agreement_authorities', 'SELECT')
     or pg_catalog.has_table_privilege('service_role', 'public.sekinfra_diagnostic_agreement_authorities', 'SELECT')
     or pg_catalog.has_table_privilege('avuhz_command_service', 'public.sekinfra_diagnostic_agreement_authorities', 'SELECT')
     or pg_catalog.has_table_privilege('avuhz_command_service', 'public.sekinfra_diagnostic_agreement_authorities', 'INSERT')
  then
    raise exception 'OIA postcondition: unintended read or write authority';
  end if;
end;
$avuhz_oia_postcondition$;

commit;
