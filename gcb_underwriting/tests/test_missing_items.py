from gcb_underwriting.engine import missing_items, overrides


def test_missing_items_and_overrides_placeholders() -> None:
    assert missing_items.placeholder() == "missing_items"
    assert overrides.placeholder() == "overrides"
