"""
MCP Tool Connections

This module provides connections to the custom MCP server (location-analyzer)
deployed on Cloud Run.

Connection Pattern: StreamableHTTP
- Uses StreamableHTTPConnectionParams for HTTP-based MCP communication
- The MCP endpoint is at: {MCP_SERVER_URL}/mcp
- This is the CUSTOM MCP pattern (vs. Google Cloud MCP servers which are managed by Google)

The MCP server provides:
- analyze_geological: Soil sample analysis via Gemini Vision
- analyze_botanical: Flora recording analysis via Gemini multimodal

Configuration: Uses MCP_SERVER_URL environment variable
- Set by sourcing set_env.sh after deploying the MCP server
- Or passed as env var in Cloud Run deployment
"""

import os
import logging

from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams

logger = logging.getLogger(__name__)


# =============================================================================
# MCP SERVER CONFIGURATION
# =============================================================================

# Get MCP server URL from environment
# This should be set to your Cloud Run service URL
MCP_SERVER_URL = os.environ.get("MCP_SERVER_URL")

# Singleton instance
_mcp_toolset = None


# =============================================================================
# MCP TOOLSET CONNECTION
# =============================================================================

def get_mcp_toolset():
    """
    Get the MCPToolset connected to the location-analyzer server.

    Uses StreamableHTTPConnectionParams for HTTP-based MCP communication.
    The FastMCP server exposes tools at the /mcp endpoint.

    Uses singleton pattern to avoid creating multiple connections.

    Returns:
        MCPToolset connected to the location-analyzer MCP server

    Raises:
        ValueError: If MCP_SERVER_URL environment variable is not set
    """
    global _mcp_toolset

    if _mcp_toolset is not None:
        return _mcp_toolset

    if not MCP_SERVER_URL:
        raise ValueError(
            "MCP_SERVER_URL environment variable not set.\n"
            "Please run:\n"
            "  export MCP_SERVER_URL='https://location-analyzer-xxx.a.run.app'\n"
            "Or add it to your set_env.sh file."
        )

    # Build the MCP endpoint URL
    # FastMCP with HTTP transport exposes the MCP protocol at /mcp
    mcp_endpoint = f"{MCP_SERVER_URL}/mcp"

    logger.info(f"[MCP Tools] Connecting to: {mcp_endpoint}")

    # Create MCPToolset with StreamableHTTP connection
    # This connects to our custom FastMCP server on Cloud Run
    _mcp_toolset = MCPToolset(
        connection_params=StreamableHTTPConnectionParams(
            url=mcp_endpoint,
            timeout=120,  # 2 minutes timeout for Gemini analysis
        )
    )

    logger.info("[MCP Tools] Connected successfully")

    return _mcp_toolset


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================
# These return the same toolset but provide semantic clarity in agent code.
# Both geological and botanical tools come from the same MCP server.

def get_geological_tool():
    """
    Get the geological analysis tool from the MCP server.

    Returns an MCPToolset that provides access to analyze_geological.
    The tool analyzes soil sample images via Gemini Vision.
    """
    return get_mcp_toolset()


def get_botanical_tool():
    """
    Get the botanical analysis tool from the MCP server.

    Returns an MCPToolset that provides access to analyze_botanical.
    The tool analyzes flora videos (visual + audio) via Gemini multimodal.
    """
    return get_mcp_toolset()
