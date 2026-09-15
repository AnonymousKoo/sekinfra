import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "consulting" / "src"))

from sekinfra_consulting.schema_registry import SchemaRegistry

registry = SchemaRegistry(ROOT / "consulting" / "contracts" / "schemas" / "v1")
schema = registry.expanded(
    "urn:sekinfra:schema:contracts:read-models:oia-engagement-progress-view:v1"
)
fixture = json.loads((ROOT / "fixtures" / "oia-engagement-progress-demo.json").read_text())
errors = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(fixture))
if errors:
    for error in errors:
        print(f"{error.json_path}: {error.message}", file=sys.stderr)
    raise SystemExit(1)

serialized = json.dumps(fixture).lower()
for forbidden in ("secure_object_reference", "password", "authorization_header", "service_role"):
    if forbidden in serialized:
        raise SystemExit(f"forbidden workspace fixture field: {forbidden}")
if fixture["implementation_authorized"] or fixture["deployment_authorized"]:
    raise SystemExit("workspace fixture cannot grant implementation or deployment authority")

print("oia workspace read-model fixture validation: PASS")
