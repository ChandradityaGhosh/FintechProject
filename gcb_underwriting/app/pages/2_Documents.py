"""Document upload and labeling page scaffold."""

from __future__ import annotations

import streamlit as st

from gcb_underwriting.app.state import initialize_state

initialize_state()

st.header("2) Documents")
st.write("Document upload and labeling workflow will be implemented in PR4+.")
st.json(st.session_state.get("documents", []))
