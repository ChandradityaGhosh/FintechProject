"""Calculations page scaffold."""

from __future__ import annotations

import streamlit as st

from gcb_underwriting.app.state import initialize_state

initialize_state()

st.header("3) Calculations")
st.write("Deterministic spread calculations will be implemented in PR2.")
st.json(st.session_state.get("calculations", {}))
