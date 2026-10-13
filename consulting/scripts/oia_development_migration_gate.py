#!/usr/bin/env python3
"""Read-only preflight of the *existing* Sekinfra OIA SQL migration chain.

This script is a BLOCKING source-level audit, not an installer, SQL executor,
provider readiness assertion, or approval to deploy. It cannot establish the
target database's policies, grants, provider state, tenant authority, or secret
configuration. No code path connects to Supabase or writes any resource.

Why: the historical migrations mix a LOCAL-ONLY shadow reconstruction with a
PRODUCTION-targeted onboarding step and additive Sekinfra OIA schema dependent
on older tenant tables. The canonical Avuhz DEVELOPMENT DATA project instead
has distinct shared tenant authority. Never replay this old chain on that
project without a separately reviewed forward-only migration plan.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"
OIA_SCHEMA = "20260827120000_create_sekinfra_phase5b_durable_schema.sql"
SHADOW = "20260816115959_reconstruct_tenant_users_continuity.sql"
ONBOARDING = "20260816120000_create_onboarding_engagements.sql"
SLICE1 = "20260823120000_create_sekinfra_slice1_durable_schema.sql"


def inspect_migrations(root: Path = MIGRATIONS) -> dict:
    """Only read local, regular, trusted-path .sql files; never execute SQL."""
    if not root.is_dir() or root.is_symlink():
        raise ValueError("canonical Sekinfra migration directory required")
    findings = []
    files = sorted(root.glob("*.sql"))
    names = {file.name for file in files}
    for required in (SHADOW, ONBOARDING, SLICE1, OIA_SCHEMA):
        if required not in names:
            findings.append({
                "code": "REQUIRED_CANONICAL_SOURCE_MISSING",
                "migration": required,
            })
    manifest = []
    for file in files:
        if not file.is_file() or file.is_symlink():
            findings.append({"code": "NON_REGULAR_SQL_SOURCE", "migration": file.name})
            continue
        raw = file.read_bytes()
        text = raw.decode("utf-8")
        body = "\n".join(
            line for line in text.splitlines()
            if line.strip() and not line.lstrip().startswith("--")
        ).strip()
        manifest.append({
            "migration": file.name,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "bytes": len(raw),
        })
        if re.search(r"(?im)^\s*--.*LOCAL[- ]ONLY", text):
            findings.append({"code": "LOCAL_ONLY_MIGRATION_FORBIDDEN_HOSTED", "migration": file.name})
        if re.search(r"(?im)^\s*--.*PRODUCTION", text):
            findings.append({"code": "PRODUCTION_TARGET_IN_HISTORICAL_CHAIN", "migration": file.name})
        if not body:
            findings.append({"code": "EMPTY_OR_PLACEHOLDER_MIGRATION", "migration": file.name})

        # A CREATE TABLE step with neither in-file RLS nor an explicitly
        # provider-validated follow-up policy is not safe as a standalone unit.
        if re.search(r"(?i)\bcreate\s+table\s+public\.", text):
            created = set(re.findall(
                r"(?i)\bcreate\s+table\s+public\.([a-z_][a-z_0-9]*)", text
            ))
            enabled = set(re.findall(
                r"(?i)\balter\s+table\s+public\.([a-z_][a-z_0-9]*)\s+enable\s+row\s+level\s+security", text
            ))
            # Phase 5B/5C use explicit table-name arrays in a DO block to
            # enable RLS, revoke anon/authenticated/public privileges, and
            # apply the consulting-service tenant policy *in the same SQL*.
            # Treat only the exact named tables as covered; never assume a
            # generic dynamic SQL statement protects an unnamed table.
            blocks = re.finditer(
                r"(?is)foreach\s+table_name\s+in\s+array\s+array\s*\[(.*?)\]\s*loop(.*?)end\s+loop",
                text,
            )
            for block in blocks:
                statements = block.group(2).lower()
                if all(marker in statements for marker in (
                    "alter table public.%i enable row level security",
                    "revoke all on table public.%i from anon,authenticated,public",
                    "create policy sekinfra_consulting_service_tenant_isolation",
                    "sekinfra.tenant_id",
                )):
                    enabled.update(re.findall(
                        r"'(sekinfra_[a-z0-9_]+)'", block.group(1).lower()
                    ))
            for table in sorted(created - enabled):
                findings.append({
                    "code": "TABLE_WITHOUT_SAME_CHANGE_RLS",
                    "migration": file.name,
                    "table": table,
                })

    if OIA_SCHEMA in names:
        oia_text = (root / OIA_SCHEMA).read_text(encoding="utf-8")
        if "references public.sekinfra_assessment_access_grants" in oia_text.lower():
            findings.append({
                "code": "OIA_REQUIRES_UNDEPLOYED_SEKINFRA_PREREQUISITES",
                "migration": OIA_SCHEMA,
            })

    return {
        "boundary": "SEKINFRA_REPOSITORY_READ_ONLY",
        "approved_hosted_migration": False,
        "source_migration_count": len(manifest),
        "source_digests": manifest,
        "blocking_findings": sorted(
            findings, key=lambda f: (f["migration"], f["code"], f.get("table", ""))
        ),
        "outcome": "BLOCKED" if findings else "SOURCE_ONLY_REVIEW_REQUIRED",
        "required_next_gate": (
            "Design separately approved forward-only DEVELOPMENT DATA OIA "
            "persistence using existing Avuhz tenant authority; verify "
            "dependencies, same-change RLS, least-privilege grants, target "
            "project, and provider schema before any apply_migration."
        ),
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Read-only BLOCKING audit of historical Sekinfra OIA SQL"
    )
    parser.add_argument("--json", action="store_true", help="print source-only audit as JSON")
    args = parser.parse_args(argv)
    result = inspect_migrations()
    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
    else:
        print("SEKINFRA OIA migration source: " + result["outcome"])
        print("SQL files inspected: " + str(result["source_migration_count"]))
        for item in result["blocking_findings"]:
            print("BLOCKED " + item["code"] + " " + item["migration"]
                  + ((" " + item["table"]) if item.get("table") else ""))
        print(result["required_next_gate"])
    return 2  # This audit never authorizes hosted deployment.


if __name__ == "__main__":
    sys.exit(main())
