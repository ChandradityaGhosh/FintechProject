from gcb_underwriting.engine import debt_service


def test_debt_service_placeholder() -> None:
    assert debt_service.placeholder() == "debt_service"
