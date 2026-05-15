"""After Effects bridge: write op file, invoke AfterFX.com -r bridge_host.jsx, read result."""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
import time
from pathlib import Path

from dotenv import load_dotenv

_REPO_ROOT = Path(__file__).resolve().parents[4]
_SKILLS_ROOT = Path(__file__).resolve().parents[1]
_MOTION_SKILLS = _SKILLS_ROOT / "motion_skills"
_BRIDGE_JSX = _MOTION_SKILLS / "bridge_host.jsx"
_TOKENS_JSON = _MOTION_SKILLS / "tokens.json"


def _load_tokens() -> dict[str, dict[str, float]]:
    data = json.loads(_TOKENS_JSON.read_text(encoding="utf-8"))
    return {str(k): v for k, v in data.items()}


def _ensure_dotenv() -> None:
    load_dotenv(_REPO_ROOT / ".env", override=False)


def _kv_write(path: Path, mapping: dict[str, str | int | float]) -> None:
    lines = [f"{k}={v}" for k, v in mapping.items()]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _kv_read(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for line in path.read_text(encoding="utf-8").splitlines():
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def _ae_binary() -> Path:
    _ensure_dotenv()
    raw = os.environ.get("MOTION_OS_AE_BINARY", "").strip().strip('"')
    if not raw:
        raise RuntimeError("MOTION_OS_AE_BINARY is not set (.env).")
    p = Path(raw)
    if not p.is_file():
        raise RuntimeError(f"MOTION_OS_AE_BINARY does not exist: {p}")
    return p


def _defaults() -> dict[str, str | int]:
    _ensure_dotenv()
    return {
        "project": os.environ.get("MOTION_OS_AE_PROJECT", "").strip(),
        "comp": os.environ.get("MOTION_OS_COMP_NAME", "").strip(),
        "layer": os.environ.get("MOTION_OS_TARGET_LAYER", "").strip(),
        "property": os.environ.get("MOTION_OS_DEFAULT_PROPERTY", "Position").strip(),
        "keyIndex": int(os.environ.get("MOTION_OS_DEFAULT_KEY_INDEX", "1")),
    }


def _vision_max_edge() -> int:
    _ensure_dotenv()
    return int(os.environ.get("MOTION_OS_VISION_MAX_EDGE", "512"))


def _vision_output_dir() -> Path:
    _ensure_dotenv()
    raw = os.environ.get("MOTION_OS_VISION_OUTPUT_DIR", "").strip()
    if not raw:
        raw = str(_REPO_ROOT / "tmp_motion_os" / "frames")
    p = Path(raw)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _run_bridge(op: dict[str, str | int | float]) -> dict[str, str]:
    if not _BRIDGE_JSX.is_file():
        raise RuntimeError(f"Missing bridge script: {_BRIDGE_JSX}")

    with tempfile.TemporaryDirectory(prefix="motion_os_ae_") as td:
        td_path = Path(td)
        op_path = td_path / "ae_op.txt"
        result_path = td_path / "ae_result.txt"
        op = {**op, "resultPath": str(result_path)}
        _kv_write(op_path, op)

        env = {**os.environ, "MOTION_OS_OP_FILE": str(op_path)}
        ae = _ae_binary()
        cmd = [str(ae), "-r", str(_BRIDGE_JSX)]
        proc = subprocess.run(
            cmd,
            env=env,
            capture_output=True,
            text=True,
            timeout=900,
            cwd=str(_REPO_ROOT),
        )
        if not result_path.is_file():
            raise RuntimeError(
                "After Effects did not write a result file.\n"
                f"returncode={proc.returncode}\nstdout:\n{proc.stdout}\nstderr:\n{proc.stderr}"
            )

        result = _kv_read(result_path)
        if result.get("ok") != "true":
            return result
        if proc.returncode != 0:
            result["warning"] = f"nonzero_returncode={proc.returncode}"
        return result


def ae_get_motion_token(
    property_name: str | None = None,
    key_index: int | None = None,
) -> dict[str, str]:
    d = _defaults()
    if property_name:
        d["property"] = property_name
    if key_index is not None:
        d["keyIndex"] = int(key_index)
    op = {
        "op": "get",
        "project": str(d["project"]),
        "comp": str(d["comp"]),
        "layer": str(d["layer"]),
        "property": str(d["property"]),
        "keyIndex": int(d["keyIndex"]),
    }
    return _run_bridge(op)


def ae_set_motion_token(token: str, property_name: str | None = None, key_index: int | None = None) -> dict[str, str]:
    tokens = _load_tokens()
    if token not in tokens:
        raise ValueError(f"Unknown motion token: {token}. See docs/intelligence/LLM.md and tokens.json.")
    t = tokens[token]
    d = _defaults()
    if property_name:
        d["property"] = property_name
    if key_index is not None:
        d["keyIndex"] = int(key_index)
    op = {
        "op": "set",
        "project": str(d["project"]),
        "comp": str(d["comp"]),
        "layer": str(d["layer"]),
        "property": str(d["property"]),
        "keyIndex": int(d["keyIndex"]),
        "easeInInfluence": float(t["easeInInfluence"]),
        "easeOutInfluence": float(t["easeOutInfluence"]),
        "easeInSpeed": 0.0,
        "easeOutSpeed": 0.0,
    }
    return _run_bridge(op)


def _downscale_png(src: Path, max_edge: int) -> Path:
    from PIL import Image

    dst = src.with_name(src.stem + "_low.png")
    with Image.open(src) as im:
        im = im.convert("RGBA")
        w, h = im.size
        longest = max(w, h)
        if longest <= max_edge:
            im.save(dst, format="PNG")
            return dst
        scale = max_edge / float(longest)
        nw = max(1, int(w * scale))
        nh = max(1, int(h * scale))
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        im.save(dst, format="PNG")
    return dst


def ae_export_vision_frame(export_time: float = 0.0) -> dict[str, str]:
    d = _defaults()
    out_dir = _vision_output_dir()
    stamp = int(time.time() * 1000)
    raw_path = out_dir / f"motion_os_vision_{stamp}.png"
    op = {
        "op": "export",
        "project": str(d["project"]),
        "comp": str(d["comp"]),
        "layer": str(d["layer"]),
        "property": str(d["property"]),
        "keyIndex": int(d["keyIndex"]),
        "outputPath": str(raw_path),
        "exportTime": float(export_time),
    }
    result = _run_bridge(op)
    if result.get("ok") != "true":
        return result

    # AE PNG sequence templates may emit a sibling filename; pick newest png in dir.
    candidates = sorted(out_dir.glob("*.png"), key=lambda p: p.stat().st_mtime, reverse=True)
    exported = raw_path if raw_path.is_file() else (candidates[0] if candidates else None)
    if exported is None or not exported.is_file():
        return {**result, "ok": "false", "error": "Export finished but no PNG was found on disk."}

    low = _downscale_png(exported, _vision_max_edge())
    return {
        **result,
        "visionPngRaw": str(exported),
        "visionPngLowRes": str(low),
        "maxEdge": str(_vision_max_edge()),
    }
