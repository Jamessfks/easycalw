"""
Astronomical Analyst Agent

This specialist agent analyzes star field images and queries the BigQuery
star catalog to triangulate the planetary position.

It uses a two-step process with TWO DIFFERENT TOOL PATTERNS:

1. LOCAL FunctionTool (extract_star_features):
   - Gemini Vision analyzes the star field image
   - Returns: primary_star, nebula_type, stellar_color

2. Google Cloud MCP server for BigQuery (execute_query via MCPToolset):
   - Connects to Google Cloud's managed BigQuery MCP server
   - Uses the pre-built execute_query tool
   - Queries the star_catalog table to find the matching biome

This demonstrates mixing local tools with managed MCP tools.

This is the PLACEHOLDER VERSION. Follow the codelab instructions
to fill in the #REPLACE sections.
"""

#REPLACE-ASTRONOMICAL-AGENT
