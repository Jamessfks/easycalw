"""
Level 1: Location Analyzer MCP Server

This MCP server provides tools for analyzing crash site evidence:
- analyze_geological: Analyze soil sample images
- analyze_botanical: Analyze flora video recordings (visual + audio)

Built with FastMCP for simple, Pythonic MCP server development.
Deployed to Cloud Run with HTTP transport for remote access.

Note: Astronomical analysis is handled separately via Google Cloud MCP server for BigQuery,
demonstrating the difference between:
- Custom MCP (this server): You write the tool logic
- Google Cloud MCP servers (BigQuery): Google hosts pre-built tools

This is the PLACEHOLDER VERSION. Follow the codelab instructions
to fill in the #REPLACE sections.
"""

import os
import json
import asyncio
import logging
from typing import Annotated

from pydantic import Field
from fastmcp import FastMCP

from google import genai
from google.genai import types as genai_types

# =============================================================================
# LOGGING SETUP
# =============================================================================

logging.basicConfig(
    format="[%(levelname)s] %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# =============================================================================
# FASTMCP SERVER INITIALIZATION
# =============================================================================
# FastMCP handles all the MCP protocol details for us.
# We just define tools using the @mcp.tool() decorator.

mcp = FastMCP("Location Analyzer MCP Server 🛸")

# =============================================================================
# GEMINI CLIENT INITIALIZATION
# =============================================================================

# Get project ID from environment
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")

if not PROJECT_ID:
    logger.warning("GOOGLE_CLOUD_PROJECT not set - tools will fail")

# Initialize Gemini client for multimodal analysis
client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION
)

logger.info(f"Initialized Gemini client for project: {PROJECT_ID}")


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def parse_json_response(text: str) -> dict:
    """
    Parse JSON from Gemini response, handling markdown formatting.
    
    Gemini sometimes wraps JSON in markdown code blocks.
    This function extracts and parses the JSON reliably.
    
    Args:
        text: Raw response text from Gemini
        
    Returns:
        Parsed JSON as dict
    """
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
        logger.error(f"JSON parse error: {e}")
        return {
            "error": f"Failed to parse JSON: {str(e)}",
            "raw_response": text[:500]
        }


# =============================================================================
# GEOLOGICAL ANALYSIS TOOL
# =============================================================================
# This tool analyzes soil sample images to identify mineral composition
# and classify the planetary biome.
#
# The tool uses Gemini's vision capabilities to examine the image and
# classify what it observes into one of four biome categories.

#REPLACE-GEOLOGICAL-TOOL


# =============================================================================
# BOTANICAL ANALYSIS TOOL
# =============================================================================
# This tool analyzes flora video recordings (with audio) to identify
# plant species and ambient sound signatures.
#
# This demonstrates Gemini's true multimodal capabilities—processing
# both visual content AND audio simultaneously for richer analysis.

#REPLACE-BOTANICAL-TOOL


# =============================================================================
# SERVER STARTUP (HTTP Transport for Cloud Run)
# =============================================================================
# FastMCP supports multiple transports:
# - "stdio": For local CLI testing (default when running directly)
# - "http": For remote access via Cloud Run (Streamable HTTP)
#
# We use HTTP transport so ADK agents can connect remotely.
# The endpoint will be: https://<cloud-run-url>/mcp

if __name__ == "__main__":
    # Get port from environment (Cloud Run sets PORT)
    port = int(os.environ.get("PORT", 8080))
    
    logger.info(f"🚀 Location Analyzer MCP Server starting on port {port}")
    logger.info(f"📍 MCP endpoint: http://0.0.0.0:{port}/mcp")
    logger.info(f"🔧 Tools: analyze_geological, analyze_botanical")
    
    # Run with HTTP transport for Cloud Run deployment
    asyncio.run(
        mcp.run_async(
            transport="http",
            host="0.0.0.0",
            port=port,
        )
    )
