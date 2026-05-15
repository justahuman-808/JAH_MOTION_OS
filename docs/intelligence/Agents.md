# Agents.md — Roster and tool access

## Roles

### Executor

- **Goal:** apply motion tokens and queue renders via MCP.
- **Allowed tools:** `ae_set_motion_token`, `ae_get_motion_token`, `ae_export_vision_frame`.
- **Must read:** `LLM.md` for token names; `Context.md` for current comp/layer overrides.

### Observer

- **Goal:** compare **AE vision frame** vs **Pencil reference PNG**; request Executor corrections.
- **Allowed tools:** `ae_export_vision_frame`, `context_snapshot_bundle` (read-only bundle for LLM), `ae_get_motion_token` (diagnostics only).
- **Prompt template (attach images after text):**

```
You are Observer for MotionStudio OS. Compare the two attached images: (1) AE vision frame, (2) Pencil reference.
List mismatches: hierarchy, spacing, scale, missing elements. Do not invent layer names; use names from Context.md.
If acceptable, say PASS in the first line; else FAIL with ordered fix list for Executor.
```

### Architect (human or meta-agent)

- Edits `LLM.md`, `Agents.md`, and skills. Commits must pass Husky `state.log` staging rule.

## Running the MCP bridge (Cursor)

1. Create `.env` from `.env.example` and set `MOTION_OS_AE_BINARY`, project path, comp/layer names.
2. Create a venv, install build basics, then deps (requires network once): `python -m pip install -U pip setuptools wheel` then `pip install -r requirements.txt` and `pip install -e .` from repo root (or skip `-e .` and rely on `PYTHONPATH=src` only).
3. Register MCP (project file): [.cursor/mcp.json](.cursor/mcp.json) — server id **`JAH_Motion_Bridge`** runs `.venv/Scripts/python.exe -m core.skills.mcp_tools.server` with `cwd` at the repo (create `.venv` and `pip install -r requirements.txt && pip install -e .` first). `PYTHONPATH=src` is set for redundancy.
4. If tools do not appear in Cursor, confirm Cursor loaded **project** MCP (`.cursor/mcp.json`), that `.venv/Scripts/python.exe` exists, and inspect the MCP server log for Python tracebacks or AE launcher errors.

## Tool summary

| Tool                      | Role        | Description                                      |
|---------------------------|------------|--------------------------------------------------|
| `ae_get_motion_token`     | Executor   | Read temporal ease at configured key/property. |
| `ae_set_motion_token`     | Executor   | Apply named token from `LLM.md`.               |
| `ae_export_vision_frame`  | Both       | Render low-res PNG of current frame.          |
| `context_snapshot_bundle` | Observer   | AE frame + Pencil path + SHA256 for logging.   |

## Definition of Done (Sprint 1, manual)

1. **Token write:** In Cursor MCP, call `ae_set_motion_token` with `brandEaseOut`; open the `.aep` and confirm ease on the configured property/key changed.
2. **Vision frame:** Call `ae_export_vision_frame`; confirm `visionPngLowRes` exists and longest edge is at most `MOTION_OS_VISION_MAX_EDGE`.
3. **Observer bundle:** Set `MOTION_OS_PENCIL_REFERENCE_PNG` to a real PNG; call `context_snapshot_bundle`; confirm `state.log` gained a `context_snapshot` JSON line and hashes are populated.
4. **Husky:** Stage a file other than `state.log` without staging `state.log` → `git commit` fails; stage `state.log` as well → commit succeeds.
