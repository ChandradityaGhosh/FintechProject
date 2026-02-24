"""Policy checks page scaffold."""

from __future__ import annotations

import streamlit as st

from gcb_underwriting.app.state import initialize_state

initialize_state()

st.header("4) Policy Checks")
st.write("JSON-driven policy engine will be implemented in PR3.")
st.json(st.session_state.get("policy_output", {}))
