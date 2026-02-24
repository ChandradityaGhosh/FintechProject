"""Streamlit home page for GCB Underwriting Engine MVP."""

from __future__ import annotations

import streamlit as st

from gcb_underwriting.app.state import initialize_state, reset_state

st.set_page_config(page_title="GCB Underwriting Engine MVP", layout="wide")
initialize_state()

st.title("GCB Underwriting Engine MVP")
st.caption(
    "Deterministic, auditable underwriting workflow for annual reviews and new-money requests."
)

col1, col2 = st.columns([3, 1])
with col1:
    st.markdown(
        """
        ### Workflow
        1. Intake
        2. Documents
        3. Calculations
        4. Policy Checks
        5. Memo
        6. Run History

        This PR provides the application scaffold, JSON contracts stubs, and sample input payload.
        """
    )
with col2:
    if st.button("Reset Session"):
        reset_state()
        st.success("Session reset.")

st.info("Use the sidebar page navigation to step through the workflow.")
