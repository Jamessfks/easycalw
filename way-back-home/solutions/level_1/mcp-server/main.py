"""
Level 1: Location Analyzer MCP Server - SOLUTION

This MCP server provides tools for analyzing crash site evidence:
- analyze_geological: Analyze soil sample images
- analyze_botanical: Analyze flora video recordings (visual + audio)

Built with FastMCP for simple, Pythonic MCP server development.
Deployed to Cloud Run with HTTP transport for remote access.

Note: Astronomical analysis is handled separately via Google Cloud MCP server for BigQuery,
demonstrating the difference between:
- Custom MCP (this server): You write the tool logic
- Google Cloud MCP servers (BigQuery): Google hosts pre-built tools

This is the COMPLETE SOLUTION.
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

GEOLOGICAL_PROMPT = """Analyze this alien soil sample image.

Classify the PRIMARY characteristic (choose exactly one):

1. CRYO - Frozen/icy minerals, crystalline structures, frost patterns,
   blue-white coloration, permafrost indicators

2. VOLCANIC - Volcanic rock, basalt, obsidian, sulfur deposits,
   red-orange minerals, heat-formed crystite structures

3. BIOLUMINESCENT - Glowing particles, phosphorescent minerals,
   organic-mineral hybrids, purple-green luminescence

4. FOSSILIZED - Ancient compressed minerals, amber deposits,
   petrified organic matter, golden-brown stratification

Examine the image carefully and determine which biome this soil
sample most likely originated from.

Respond ONLY with valid JSON (no markdown, no explanation):
{
    "biome": "CRYO|VOLCANIC|BIOLUMINESCENT|FOSSILIZED",
    "confidence": 0.0-1.0,
    "minerals_detected": ["mineral1", "mineral2"],
    "description": "Brief description of what you observe"
}
"""


@mcp.tool()
def analyze_geological(
    image_url: Annotated[
        str,
        Field(description="Cloud Storage URL (gs://...) of the soil sample image")
    ]
) -> dict:
    """
    Analyzes a soil sample image to identify mineral composition and classify the planetary biome.
    
    This tool uses Gemini's vision capabilities to examine soil samples and determine
    which of the four planetary biomes (CRYO, VOLCANIC, BIOLUMINESCENT, FOSSILIZED)
    the sample most likely originated from.
    
    Args:
        image_url: Cloud Storage URL of the soil sample image (gs://bucket/path/image.png)
        
    Returns:
        dict containing:
        - biome: The classified biome (CRYO, VOLCANIC, BIOLUMINESCENT, or FOSSILIZED)
        - confidence: Confidence score (0.0 to 1.0)
        - minerals_detected: List of minerals identified in the sample
        - description: Brief description of observations
    """
    logger.info(f">>> 🔬 Tool: 'analyze_geological' called for '{image_url}'")
    
    try:
        # Call Gemini with the image
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                GEOLOGICAL_PROMPT,
                genai_types.Part.from_uri(file_uri=image_url, mime_type="image/png")
            ]
        )
        
        # Parse the JSON response
        result = parse_json_response(response.text)
        
        logger.info(f"    ✓ Geological analysis complete: {result.get('biome', 'UNKNOWN')}")
        
        return result
        
    except Exception as e:
        logger.error(f"    ✗ Geological analysis failed: {str(e)}")
        return {
            "error": str(e),
            "biome": "UNKNOWN",
            "confidence": 0.0,
            "minerals_detected": [],
            "description": f"Analysis failed: {str(e)}"
        }


# =============================================================================
# BOTANICAL ANALYSIS TOOL
# =============================================================================
# This tool analyzes flora video recordings (with audio) to identify
# plant species and ambient sound signatures.

BOTANICAL_PROMPT = """Analyze this alien flora video recording.

Pay attention to BOTH:
1. VISUAL elements: Plant appearance, movement patterns, colors, bioluminescence
2. AUDIO elements: Ambient sounds, rustling, organic noises, frequencies

Classify the PRIMARY biome (choose exactly one):

1. CRYO - Crystalline ice-plants, frost-covered vegetation, 
   crackling/tinkling sounds, slow brittle movements, blue-white flora

2. VOLCANIC - Heat-resistant plants, sulfur-adapted species,
   hissing/bubbling sounds, smoke-filtering vegetation, red-orange flora

3. BIOLUMINESCENT - Glowing plants, pulsing light patterns,
   humming/resonating sounds, reactive to stimuli, purple-green flora

4. FOSSILIZED - Ancient petrified plants, amber-preserved specimens,
   deep resonant sounds, minimal movement, golden-brown flora

Examine BOTH the visuals AND audio of this recording to determine
which biome this flora most likely belongs to.

Respond ONLY with valid JSON (no markdown, no explanation):
{
    "biome": "CRYO|VOLCANIC|BIOLUMINESCENT|FOSSILIZED",
    "confidence": 0.0-1.0,
    "species_detected": ["species1", "species2"],
    "audio_signatures": ["sound1", "sound2"],
    "visual_features": ["feature1", "feature2"],
    "description": "Brief description of visual and audio observations"
}
"""


@mcp.tool()
def analyze_botanical(
    video_url: Annotated[
        str,
        Field(description="Cloud Storage URL (gs://...) of the flora video recording")
    ]
) -> dict:
    """
    Analyzes a flora video recording (visual + audio) to identify plant species and classify the biome.
    
    This tool demonstrates Gemini's true multimodal capabilities—processing BOTH
    visual content AND audio simultaneously for richer analysis. The audio track
    often contains important biome indicators like crackling ice, volcanic hissing,
    or bioluminescent humming.
    
    Args:
        video_url: Cloud Storage URL of the flora video (gs://bucket/path/video.mp4)
        
    Returns:
        dict containing:
        - biome: The classified biome (CRYO, VOLCANIC, BIOLUMINESCENT, or FOSSILIZED)
        - confidence: Confidence score (0.0 to 1.0)
        - species_detected: List of plant species identified
        - audio_signatures: List of audio patterns detected
        - visual_features: List of visual characteristics observed
        - description: Brief description of visual and audio observations
    """
    logger.info(f">>> 🌿 Tool: 'analyze_botanical' called for '{video_url}'")
    
    try:
        # Call Gemini with the video (processes both visual and audio)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                BOTANICAL_PROMPT,
                genai_types.Part.from_uri(file_uri=video_url, mime_type="video/mp4")
            ]
        )
        
        # Parse the JSON response
        result = parse_json_response(response.text)
        
        logger.info(f"    ✓ Botanical analysis complete: {result.get('biome', 'UNKNOWN')}")
        
        return result
        
    except Exception as e:
        logger.error(f"    ✗ Botanical analysis failed: {str(e)}")
        return {
            "error": str(e),
            "biome": "UNKNOWN",
            "confidence": 0.0,
            "species_detected": [],
            "audio_signatures": [],
            "visual_features": [],
            "description": f"Analysis failed: {str(e)}"
        }


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
