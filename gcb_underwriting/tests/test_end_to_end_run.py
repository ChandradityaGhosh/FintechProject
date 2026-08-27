import json
from pathlib import Path


def test_sample_data_files_exist() -> None:
    base = Path("gcb_underwriting/sample_data")
    assert json.loads((base / "deal_input_example.json").read_text())["deal_name"]
    assert json.loads((base / "policy_rules_example.json").read_text())["metadata"]["bank"] == "GCB"
