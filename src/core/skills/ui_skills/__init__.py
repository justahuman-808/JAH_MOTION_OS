"""UI / Pencil.dev helpers (Sprint 1 stubs)."""

from __future__ import annotations

import os


def pencil_reference_png_path() -> str | None:
    """Return path from env for a static Pencil export PNG, if configured."""
    p = os.environ.get("MOTION_OS_PENCIL_REFERENCE_PNG", "").strip()
    return p or None
