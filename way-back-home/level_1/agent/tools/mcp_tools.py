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

This is the PLACEHOLDER VERSION. Follow the codelab instructions
to fill in the #REPLACE sections.
"""

#REPLACE-MCP-TOOL-CONNECTION
