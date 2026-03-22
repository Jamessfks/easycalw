"""
Tools for the Mission Analysis AI agents.

This package contains:
- MCP tool connections (geological, botanical analysis via custom Cloud Run MCP)
- Star analysis tools (Gemini Vision + Google Cloud MCP server for BigQuery)
- Location confirmation tool (uses ToolContext for state access)

Demonstrates TWO MCP patterns:
1. Custom MCP: Your own MCP server on Cloud Run (location-analyzer)
2. Google Cloud MCP servers: Google-hosted MCP (BigQuery at bigquery.googleapis.com/mcp)

Plus ToolContext for accessing state in tools.
"""

from agent.tools.mcp_tools import get_geological_tool, get_botanical_tool
from agent.tools.star_tools import extract_star_features_tool, get_bigquery_mcp_toolset
from agent.tools.confirm_tools import confirm_location_tool

__all__ = [
    "get_geological_tool",
    "get_botanical_tool",
    "extract_star_features_tool",
    "get_bigquery_mcp_toolset",
    "confirm_location_tool"
]