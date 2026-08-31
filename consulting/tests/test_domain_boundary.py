from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class DomainBoundaryTests(unittest.TestCase):
    def test_runtime_has_no_avuhz_private_import_or_phase5d_governance(self):
        prohibited = (
            "avuhz_runtime", "phase5d_", "ImplementationBrief",
            "ImplementationAuthorization", "CodexBuildPackage",
            "BuildExecutionResult", "QAResult", "DeploymentAuthorization",
        )
        violations = []
        for path in (ROOT / "src").rglob("*.py"):
            text = path.read_text()
            for marker in prohibited:
                if marker in text:
                    violations.append(f"{path.relative_to(ROOT)}:{marker}")
        self.assertEqual(violations, [])

    def test_only_public_contract_names_avuhz(self):
        violations = []
        for base in (ROOT / "src", ROOT / "contracts", ROOT / "migrations"):
            for path in base.rglob("*"):
                if not path.is_file() or path.name.endswith((".pyc", ".pyo")):
                    continue
                text = path.read_text(errors="ignore").lower()
                if "avuhz" in text and path != ROOT / "contracts/public/implementation-handoff.schema.json":
                    violations.append(str(path.relative_to(ROOT)))
        self.assertEqual(violations, [])


if __name__ == "__main__":
    unittest.main()
