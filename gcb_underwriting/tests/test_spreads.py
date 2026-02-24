from gcb_underwriting.engine import spreads_business, spreads_cre, spreads_global, spreads_guarantor


def test_spread_placeholders() -> None:
    assert spreads_business.placeholder() == "spreads_business"
    assert spreads_cre.placeholder() == "spreads_cre"
    assert spreads_guarantor.placeholder() == "spreads_guarantor"
    assert spreads_global.placeholder() == "spreads_global"
