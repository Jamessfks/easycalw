"""
Star Analysis Tools

This module provides tools for astronomical analysis using TWO different patterns:

1. LOCAL FUNCTION TOOL (extract_star_features):
   - Uses Gemini Vision directly to analyze star field images
   - Returns structured stellar features (primary_star, nebula_type, etc.)

2. Google Cloud MCP server for BigQuery (query via MCPToolset):
   - Connects to Google Cloud's managed BigQuery MCP server
   - Uses the pre-built execute_query tool to query the star_catalog
   - Demonstrates the MANAGED MCP pattern vs. custom MCP

This is the PLACEHOLDER VERSION. Follow the codelab instructions
to fill in the #REPLACE sections.
"""

#REPLACE-STAR-TOOLS
