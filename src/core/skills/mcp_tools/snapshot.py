"""Observer context snapshot: AE frame + Pencil reference paths and hashes."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from core.skills.mcp_tools import ae_bridge
from core.skills.ui_skills import pencil_reference_png_path

_REPO_ROOT = Path(__file__).resolve().parents[4]
_STATE_LOG = _REPO_ROOT / "state.log"


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def append_state_log(record: dict) -> None:
    record.setdefault("ts", datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    line = json.dumps(record, ensure_ascii=False) + "\n"
    _STATE_LOG.parent.mkdir(parents=True, exist_ok=True)
    with _STATE_LOG.open("a", encoding="utf-8") as f:
        f.write(line)


def context_snapshot_bundle(reference_png: str | None = None) -> dict[str, object]:
    """Export AE vision frame, hash AE + Pencil PNGs, append JSONL to state.log."""
    ref = (reference_png or "").strip() or pencil_reference_png_path()
    if not ref:
        raise ValueError(
            "No Pencil reference PNG: pass reference_png or set MOTION_OS_PENCIL_REFERENCE_PNG in .env."
        )
    ref_path = Path(ref)
    if not ref_path.is_file():
        raise FileNotFoundError(f"Pencil reference not found: {ref_path}")

    export = ae_bridge.ae_export_vision_frame(0.0)
    if export.get("ok") != "true":
        append_state_log(
            {
                "event": "context_snapshot_failed",
                "detail": "ae_export_vision_frame failed",
                "export": export,
            }
        )
        return {"ok": False, "export": export}

    low = Path(str(export["visionPngLowRes"]))
    hashes = {
        "pencil_reference_sha256": _sha256_file(ref_path),
        "ae_vision_low_sha256": _sha256_file(low),
    }
    bundle = {
        "ok": True,
        "pencil_reference_png": str(ref_path.resolve()),
        "ae_vision_png_raw": export.get("visionPngRaw"),
        "ae_vision_png_low_res": str(low.resolve()),
        "hashes": hashes,
        "observer_prompt": (
            "Attach the two images in order: (1) AE vision low-res PNG, (2) Pencil reference PNG. "
            "Follow Observer rules in docs/intelligence/Agents.md."
        ),
    }
    append_state_log(
        {
            "event": "context_snapshot",
            "detail": "AE vision + Pencil reference hashed for Observer",
            "paths": {
                "pencil_reference_png": bundle["pencil_reference_png"],
                "ae_vision_png_low_res": bundle["ae_vision_png_low_res"],
            },
            "hashes": hashes,
        }
    )
    return bundle
