# GCB Underwriting Engine MVP

PR1 scaffolds a deterministic, auditable underwriting platform for commercial credit workflows.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run Streamlit

```bash
python main.py
```

Or directly:

```bash
streamlit run gcb_underwriting/app/ui.py
```

## Run Tests

```bash
pytest
```

## Lint and Format

```bash
ruff check .
black .
```

## Repo Layout

```text
gcb_underwriting/
├── app/
│   ├── ui.py
│   ├── pages/
│   │   ├── 1_Intake.py
│   │   ├── 2_Documents.py
│   │   ├── 3_Calculations.py
│   │   ├── 4_Policy_Checks.py
│   │   ├── 5_Memo.py
│   │   └── 6_Run_History.py
│   └── state.py
├── engine/
│   ├── models.py
│   ├── io.py
│   ├── debt_service.py
│   ├── spreads_business.py
│   ├── spreads_cre.py
│   ├── spreads_guarantor.py
│   ├── spreads_global.py
│   ├── borrowing_base.py
│   ├── relationship_metrics.py
│   ├── policy_schema.py
│   ├── policy_engine.py
│   ├── missing_items.py
│   ├── overrides.py
│   ├── explainability.py
│   └── utils.py
├── contracts/
│   ├── intake_contract.json
│   ├── policy_rules.json
│   ├── document_checklist.json
│   └── enums.json
├── templates/
│   └── memo_template.html
├── data/
│   └── runs/
├── sample_data/
│   ├── deal_input_example.json
│   ├── policy_rules_example.json
│   └── expected_outputs/
│       ├── calculations_expected.json
│       └── policy_expected.json
└── tests/
    ├── test_debt_service.py
    ├── test_spreads.py
    ├── test_policy_engine.py
    ├── test_missing_items.py
    └── test_end_to_end_run.py
```

## Contracts in this PR

- `intake_contract.json`: typed required fields, deal sections, input/computed split.
- `document_checklist.json`: required documents by deal type + criticality.
- `policy_rules.json`: metadata + empty rules array for policy versioning bootstrap.
- `enums.json`: shared enum values for contracts and validation.

## How to Add New Policy Rules Safely

1. Add or update rule entries in `gcb_underwriting/contracts/policy_rules.json`.
2. Keep metadata version current (`YYYY-MM-DD`) and document policy owner + notes.
3. Validate schema compatibility in PR3+ policy schema tooling.
4. Add unit tests for every new rule type and edge case.
5. Update sample expected outputs when policy behavior changes.

## PR1 Scope

- Repo scaffold and file layout.
- Streamlit multipage skeleton.
- Engine module placeholders.
- Contract stubs and sample data.
- Baseline test/lint/format configuration.
