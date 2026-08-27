"""Run history page scaffold."""

from __future__ import annotations

import streamlit as st

from gcb_underwriting.app.state import initialize_state

initialize_state()

st.header("6) Run History")
st.write("Run history and snapshot exploration will be implemented in PR5.")
