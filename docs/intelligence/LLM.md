# LLM.md — MotionStudio OS (Constitution)

This file is the **source of truth** for motion vocabulary, guardrails, and repository contracts. Agents must obey it before calling execution tools.

## Motion tokens (Sprint 1)

Tokens map to **temporal ease** on a single keyframe of the configured property (default: `Position`, key index `1`). Values are **influence** (0–100) pairs for AE `KeyframeEase` construction; speeds are set to `0` for standard smooth curves.

| Token            | easeIn influence | easeOut influence | Notes                          |
|------------------|------------------|-------------------|--------------------------------|
| `linearHold`     | 0                | 0                 | Mechanical / UI reference      |
| `brandEaseOut`   | 60               | 12                | Default product motion         |
| `brandEaseInOut` | 33               | 33                | Balanced editorial             |
| `snappyMicro`    | 80               | 5                 | Small spatial corrections      |

Adding a token requires:

1. Update this table.
2. Update `src/core/skills/motion_skills/tokens.json` (machine list for JSX generation).
3. Append a line to `state.log` describing the change (Husky sentinel).

## `state.log` contract

- **Format:** one JSON object per line (JSONL), UTF-8.
- **Required fields:** `ts` (ISO-8601 UTC), `event` (short snake_case), `detail` (human summary).
- **Optional:** `paths` (object), `hashes` (object), `token`, `op`.
- Any commit that touches tracked project files **must** stage an updated `state.log` entry for that change (see `.husky/pre-commit`).

## Architectural rules

1. **No raw AE surgery in chat:** the model selects **tokens and targets**, not hand-written ExtendScript, except inside `motion_skills/` maintenance.
2. **Pencil is spatial truth:** coordinates and hierarchy originate from Pencil exports; AE obeys mapped comps/layers named in `.env`.
3. **Vision beats property dumps:** when validating layout, prefer `ae_export_vision_frame` plus reference PNG over guessing from AE trees alone.

## File layout (authoritative)

- Intelligence: `docs/intelligence/`
- Skills: `src/core/skills/motion_skills/`, `mcp_tools/`, `ui_skills/`
- Governance: `.husky/`, `.cursor/rules/`
