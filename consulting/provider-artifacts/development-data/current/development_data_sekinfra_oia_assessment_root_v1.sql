-- SOURCE ONLY. NOT APPLIED.
-- Target, after separate exact approval: Supabase DEVELOPMENT DATA gnuqaefotwgkwurjpyik.
-- NEVER execute on DEVELOPMENT AUTH pwlhruwutoitnieactol, production, or
-- any legacy Sekinfra database. No retry and no implicit follow-on migration.
--
-- Exactly one new Sekinfra DOMAIN table. Avuhz owns the existing tenant and
-- engagement authority; this migration does not create any tenant, login,
-- role, session, billing, automation, or credential infrastructure.
--
-- This is an INERT OIA assessment persistence root, NOT OIA activation.
-- Before any write/read grant or provider adapter, separately establish the
-- verified Sekinfra diagnostic scope, agreement, payment, access grant,
-- guarded command authority, and least-privileged tenant-scoped DB role.
-- Intentionally NO table privileges or RLS policy are granted to a runtime.
-- Forced RLS plus no matching policy denies all non-bypass access.
-- The prior LOCAL-ONLY/PRODUCTION-annotated migration chain is prohibited.

begin;

do $avuhz_oia_preflight$
begin
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
  if to_regclass('public.sekinfra_oia_assessments') is not null
     or exists (
       select 1 from pg_catalog.pg_class c
       where c.relnamespace = 'public'::regnamespace
         and c.relname like 'sekinfra_%'
         and c.relkind in ('r','p')
     )
  then
    raise exception 'DEVELOPMENT DATA preflight: existing Sekinfra resources or replay';
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

create table public.sekinfra_oia_assessments (
  tenant_id uuid not null,
  oia_assessment_id uuid not null,
  engagement_id uuid not null,
  diagnostic_scope_id uuid not null,
  diagnostic_scope_version integer not null check (diagnostic_scope_version > 0),
  assessment_access_grant_id uuid not null,
  state text not null check (
    state in ('IN_PROGRESS','READY_FOR_DELIVERY','FINDINGS_DELIVERED','CLOSED')
  ),
  record_version integer not null check (record_version > 0),
  record jsonb not null check (jsonb_typeof(record) = 'object'),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint sekinfra_oia_assessments_pkey
    primary key (tenant_id, oia_assessment_id),
  constraint sekinfra_oia_assessments_one_grant
    unique (tenant_id, assessment_access_grant_id),
  constraint sekinfra_oia_assessments_avuhz_tenant_fkey
    foreign key (tenant_id)
    references public.avuhz_tenant_organizations (tenant_id),
  constraint sekinfra_oia_assessments_avuhz_engagement_fkey
    foreign key (tenant_id,engagement_id)
    references public.avuhz_engagements (tenant_id,engagement_id),
  -- Provider-neutral Sekinfra domain record, never Avuhz core authority.
  constraint sekinfra_oia_assessments_record_binding
    check ((
      record->>'tenant_id' = tenant_id::text
      and record->>'oia_assessment_id' = oia_assessment_id::text
      and record->>'engagement_id' = engagement_id::text
      and record->>'diagnostic_scope_id' = diagnostic_scope_id::text
      and (record->>'diagnostic_scope_version')::integer = diagnostic_scope_version
      and record->>'assessment_access_grant_id' = assessment_access_grant_id::text
      and record->>'state' = state
      and (record->>'record_version')::integer = record_version
    ) is true)
);

alter table public.sekinfra_oia_assessments enable row level security;
alter table public.sekinfra_oia_assessments force row level security;

-- Explicitly revoke legacy/default provider exposure after the DDL. A
-- privileged migration owner can still administer the table; no application
-- identity is permitted to read or mutate it until a separately approved
-- Sekinfra domain adapter and fail-closed tenant RLS policy are established.
revoke all privileges on table public.sekinfra_oia_assessments
  from public, anon, authenticated, service_role,
       avuhz_command_service, avuhz_acquisition_service_dev,
       avuhz_data_runtime_service_dev, avuhz_acquisition_runtime_service_dev;

comment on table public.sekinfra_oia_assessments is
  'Sekinfra OIA domain persistence, DEVELOPMENT DATA v1. Inert, forced-RLS, no runtime privileges. Avuhz retains sole tenant and engagement authority.';

do $avuhz_oia_postcondition$
declare
  has_rls boolean;
  forced boolean;
  policy_count integer;
begin
  select c.relrowsecurity, c.relforcerowsecurity
    into has_rls, forced
  from pg_catalog.pg_class c
  where c.oid = 'public.sekinfra_oia_assessments'::regclass;
  if has_rls is distinct from true or forced is distinct from true then
    raise exception 'OIA postcondition: forced RLS missing';
  end if;
  select count(*) into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public' and tablename = 'sekinfra_oia_assessments';
  if policy_count <> 0 then
    raise exception 'OIA postcondition: unexpected access policy';
  end if;
  if pg_catalog.has_table_privilege('anon', 'public.sekinfra_oia_assessments', 'SELECT')
     or pg_catalog.has_table_privilege('authenticated', 'public.sekinfra_oia_assessments', 'SELECT')
     or pg_catalog.has_table_privilege('service_role', 'public.sekinfra_oia_assessments', 'SELECT')
     or pg_catalog.has_table_privilege('avuhz_command_service', 'public.sekinfra_oia_assessments', 'SELECT')
     or pg_catalog.has_table_privilege('avuhz_command_service', 'public.sekinfra_oia_assessments', 'INSERT')
  then
    raise exception 'OIA postcondition: unintended read or write authority';
  end if;
end;
$avuhz_oia_postcondition$;

commit;
