from gcb_underwriting.engine import policy_engine


def test_policy_engine_placeholder() -> None:
    assert policy_engine.placeholder() == "policy_engine"
