"""MCP stdio server exposing After Effects motion token + vision tools."""

from __future__ import annotations

import json

from mcp.server.fastmcp import FastMCP

from core.skills.mcp_tools import ae_bridge, snapshot

mcp = FastMCP("JAH_Motion_Bridge")


@mcp.tool()
def ae_get_motion_token(property_name: str | None = None, key_index: int | None = None) -> str:
    """Read temporal ease (first dimension) for the configured layer/property at key_index."""
    data = ae_bridge.ae_get_motion_token(property_name=property_name, key_index=key_index)
    return json.dumps(data, indent=2)


@mcp.tool()
def ae_set_motion_token(token: str, property_name: str | None = None, key_index: int | None = None) -> str:
    """Apply a named motion token (see docs/intelligence/LLM.md) to the configured keyframe."""
    data = ae_bridge.ae_set_motion_token(token, property_name=property_name, key_index=key_index)
    return json.dumps(data, indent=2)


@mcp.tool()
def ae_export_vision_frame(export_time: float = 0.0) -> str:
    """Render a still from the configured comp and return raw + low-res PNG paths on disk."""
    data = ae_bridge.ae_export_vision_frame(export_time=export_time)
    return json.dumps(data, indent=2)


@mcp.tool()
def context_snapshot_bundle(reference_png: str | None = None) -> str:
    """Build Observer bundle: export AE frame, hash against Pencil reference, append state.log."""
    data = snapshot.context_snapshot_bundle(reference_png=reference_png)
    return json.dumps(data, indent=2)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
