"""Session state helpers for the underwriting Streamlit app."""

from __future__ import annotations

from typing import Any

import streamlit as st

DEFAULT_STATE: dict[str, Any] = {
    "run_id": None,
    "intake": {},
    "documents": [],
    "calculations": {},
    "policy_output": {},
    "missing_items": {},
    "overrides": [],
}


def initialize_state() -> None:
    """Initialize all expected session keys for predictable page behavior."""
    for key, value in DEFAULT_STATE.items():
        if key not in st.session_state:
            st.session_state[key] = value


def reset_state() -> None:
    """Reset underwriting workflow state in the current session."""
    for key, value in DEFAULT_STATE.items():
        st.session_state[key] = value
