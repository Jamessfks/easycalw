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

Configuration: Uses environment variables only (no config_utils)
- GOOGLE_CLOUD_PROJECT: Required for Gemini client and BigQuery queries
- Set by sourcing set_env.sh (local) or Cloud Run env vars (deployed)
"""

import os
import json
import logging

from google import genai
from google.genai import types as genai_types
from google.adk.tools import FunctionTool
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StreamableHTTPConnectionParams
import google.auth
import google.auth.transport.requests

logger = logging.getLogger(__name__)


# =============================================================================
# CONFIGURATION - Environment variables only
# =============================================================================

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "")

if not PROJECT_ID:
    logger.warning("[Star Tools] GOOGLE_CLOUD_PROJECT not set - BigQuery queries will fail")

# Initialize Gemini client for star feature extraction
genai_client = genai.Client(
    vertexai=True,
    project=PROJECT_ID or "placeholder",
    location=os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
)

logger.info(f"[Star Tools] Initialized for project: {PROJECT_ID}")


# =============================================================================
# Google Cloud MCP server for BigQuery Connection
# =============================================================================
# This is the MANAGED MCP pattern - connecting to Google's BigQuery MCP server
# instead of building our own or using the BigQuery Python SDK directly.

BIGQUERY_MCP_URL = "https://bigquery.googleapis.com/mcp"

_bigquery_toolset = None


def get_bigquery_mcp_toolset():
    """
    Get the MCPToolset connected to Google's BigQuery MCP server.

    This uses OAuth 2.0 authentication with Application Default Credentials.
    The toolset provides access to BigQuery's pre-built MCP tools like:
    - execute_query: Run SQL queries
    - list_datasets: List available datasets
    - get_table_schema: Get table structure

    Returns:
        MCPToolset configured for BigQuery MCP
    """
    global _bigquery_toolset

    if _bigquery_toolset is not None:
        return _bigquery_toolset

    logger.info("[Star Tools] Connecting to Google Cloud MCP server for BigQuery...")

    # Get OAuth credentials
    credentials, project_id = google.auth.default(
        scopes=["https://www.googleapis.com/auth/bigquery"]
    )

    # Refresh to get a valid token
    credentials.refresh(google.auth.transport.requests.Request())
    oauth_token = credentials.token

    # Use discovered project_id if not set in environment
    effective_project_id = PROJECT_ID or project_id

    # Configure headers for BigQuery MCP
    headers = {
        "Authorization": f"Bearer {oauth_token}",
        "x-goog-user-project": effective_project_id
    }

    # Create MCPToolset with StreamableHTTP connection
    _bigquery_toolset = MCPToolset(
        connection_params=StreamableHTTPConnectionParams(
            url=BIGQUERY_MCP_URL,
            headers=headers
        )
    )

    logger.info(f"[Star Tools] Connected to BigQuery MCP for project: {effective_project_id}")
    return _bigquery_toolset


# =============================================================================
# Local FunctionTool: Star Feature Extraction
# =============================================================================
# This is a LOCAL tool that calls Gemini directly - demonstrating that
# you can mix local FunctionTools with MCP tools in the same agent.

STAR_EXTRACTION_PROMPT = """Analyze this alien night sky image and extract stellar features.

Look for and identify:

1. PRIMARY STAR TYPE - What kind of star dominates the sky?
   Options: blue_giant, blue_supergiant, red_dwarf, red_dwarf_binary, red_giant, 
            green_pulsar, pulsar, magnetar, yellow_sun, yellow_dwarf, orange_sun

2. NEBULA TYPE - What kind of nebula or cosmic formation is visible?
   Options: ice_blue, crystalline, orange_red, fire, purple_magenta, purple, 
            bioluminescent, golden, amber, golden_brown

3. STELLAR COLOR - What's the overall color temperature of the stars?
   Options: blue_white, cyan, red_orange, deep_red, green_purple, green, 
            cyan_purple, yellow_gold, warm_yellow, amber

Examine the image carefully and identify the BEST match for each category.

Respond ONLY with valid JSON (no markdown, no explanation):
{"primary_star": "...", "nebula_type": "...", "stellar_color": "...", "description": "brief description of what you observe"}
"""


def _parse_json_response(text: str) -> dict:
    """Parse JSON from Gemini response, handling markdown formatting."""
    cleaned = text.strip()

    # Remove markdown code blocks if present
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        return {
            "error": f"Failed to parse response: {str(e)}",
            "raw_response": text[:500]
        }


def extract_star_features(image_url: str) -> dict:
    """
    Extract stellar features from a star field image using Gemini Vision.

    This is a LOCAL tool that calls Gemini directly.
    The agent will use this alongside the BigQuery MCP tools.

    Args:
        image_url: Cloud Storage URL of the star field image (gs://...)

    Returns:
        dict with primary_star, nebula_type, stellar_color, description
    """
    logger.info(f"[Stars] Extracting features from: {image_url}")

    try:
        response = genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                STAR_EXTRACTION_PROMPT,
                genai_types.Part.from_uri(file_uri=image_url, mime_type="image/png")
            ]
        )

        result = _parse_json_response(response.text)

        logger.info(f"[Stars] Extracted: primary_star={result.get('primary_star')}, "
                   f"nebula={result.get('nebula_type')}")

        return result

    except Exception as e:
        logger.error(f"[Stars] Feature extraction failed: {str(e)}")
        return {
            "error": str(e),
            "primary_star": "unknown",
            "nebula_type": "unknown",
            "stellar_color": "unknown"
        }


# Create the local FunctionTool
extract_star_features_tool = FunctionTool(extract_star_features)
