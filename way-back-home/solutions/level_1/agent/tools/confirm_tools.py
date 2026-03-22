"""
Location Confirmation Tool

This module provides the tool for confirming the explorer's location
and activating the rescue beacon via the backend API.

Key ADK Pattern: ToolContext for State Access
- Tools receive a ToolContext parameter
- Use tool_context.state.get("key") to read state values
- State values are set by the root agent's before_agent_callback
- This keeps tools simple - no config file reading needed
"""

import os
import logging
import requests

from google.adk.tools import FunctionTool
from google.adk.tools.tool_context import ToolContext

logger = logging.getLogger(__name__)


# Biome to quadrant mapping
BIOME_TO_QUADRANT = {
    "CRYO": "NW",
    "VOLCANIC": "NE",
    "BIOLUMINESCENT": "SW",
    "FOSSILIZED": "SE"
}

QUADRANT_TO_BIOME = {v: k for k, v in BIOME_TO_QUADRANT.items()}


def _get_actual_biome(x: int, y: int) -> tuple[str, str]:
    """
    Determine the actual biome and quadrant from coordinates.

    Args:
        x: X coordinate (0-100)
        y: Y coordinate (0-100)

    Returns:
        tuple of (quadrant, biome)
    """
    if x < 50 and y >= 50:
        return "NW", "CRYO"
    elif x >= 50 and y >= 50:
        return "NE", "VOLCANIC"
    elif x < 50 and y < 50:
        return "SW", "BIOLUMINESCENT"
    else:
        return "SE", "FOSSILIZED"


def confirm_location(biome: str, tool_context: ToolContext) -> dict:
    """
    Confirm the explorer's location and activate the rescue beacon.

    This tool validates the determined biome against the explorer's actual
    coordinates and calls the backend API to activate the beacon.

    Uses ToolContext to read state values set by before_agent_callback:
    - participant_id
    - x, y coordinates
    - backend_url

    Args:
        biome: The determined biome from analysis
               (CRYO, VOLCANIC, BIOLUMINESCENT, or FOSSILIZED)
        tool_context: ADK ToolContext providing access to state

    Returns:
        dict with success status and message
    """
    # Read participant context from state (set by before_agent_callback)
    participant_id = tool_context.state.get("participant_id", "")
    x = tool_context.state.get("x", 0)
    y = tool_context.state.get("y", 0)
    backend_url = tool_context.state.get("backend_url", "https://api.waybackhome.dev")

    # Fallback to environment variables if state is empty
    if not participant_id:
        participant_id = os.environ.get("PARTICIPANT_ID", "")
    if not backend_url:
        backend_url = os.environ.get("BACKEND_URL", "https://api.waybackhome.dev")

    logger.info(f"[Confirm] participant_id={participant_id}, coords=({x}, {y})")

    if not participant_id:
        return {
            "success": False,
            "message": "❌ No participant ID available. Please check configuration."
        }

    # Normalize input
    biome_upper = biome.upper().strip()

    # Validate biome is recognized
    if biome_upper not in BIOME_TO_QUADRANT:
        return {
            "success": False,
            "message": f"❌ Unknown biome: {biome}. Must be one of: CRYO, VOLCANIC, BIOLUMINESCENT, FOSSILIZED"
        }

    # Get actual biome from coordinates
    actual_quadrant, actual_biome = _get_actual_biome(x, y)

    logger.info(f"[Confirm] Validating: claimed={biome_upper}, actual={actual_biome}")

    # Check if the analysis is correct
    if biome_upper != actual_biome:
        logger.warning(f"[Confirm] Mismatch! claimed={biome_upper}, actual={actual_biome}")
        return {
            "success": False,
            "message": (
                f"❌ Location mismatch!\n\n"
                f"Your analysis determined: {biome_upper}\n"
                f"But the evidence actually indicates: {actual_biome}\n\n"
                f"Please re-analyze the crash site evidence more carefully."
            ),
            "hint": f"Look for characteristics of the {actual_biome} biome."
        }

    # Biome is correct! Now activate the beacon
    quadrant = BIOME_TO_QUADRANT[biome_upper]

    try:
        logger.info(f"[Confirm] Calling backend to confirm location...")

        # Call the backend's location confirmation endpoint
        response = requests.patch(
            f"{backend_url}/participants/{participant_id}/location",
            params={"x": x, "y": y},
            timeout=10
        )
        response.raise_for_status()

        logger.info(f"[Confirm] Location confirmed successfully!")

        return {
            "success": True,
            "message": (
                f"🔦 BEACON ACTIVATED!\n\n"
                f"Location confirmed: {biome_upper} biome in the {quadrant} quadrant.\n"
                f"Coordinates: ({x}, {y})\n\n"
                f"Your rescue beacon is now broadcasting at full strength!\n"
                f"Rescue teams can lock onto your signal.\n\n"
                f"Welcome to the {biome_upper} zone, explorer. Stay near your crash site."
            ),
            "quadrant": quadrant,
            "biome": biome_upper,
            "coordinates": {"x": x, "y": y}
        }

    except requests.exceptions.ConnectionError:
        # Backend not available - simulate success for local testing
        logger.warning("[Confirm] Backend not available, simulating success")

        return {
            "success": True,
            "message": (
                f"🔦 BEACON ACTIVATED! (Local simulation)\n\n"
                f"Location confirmed: {biome_upper} biome in the {quadrant} quadrant.\n"
                f"Coordinates: ({x}, {y})\n\n"
                f"Note: Backend unavailable - this is a local test confirmation."
            ),
            "quadrant": quadrant,
            "biome": biome_upper,
            "coordinates": {"x": x, "y": y},
            "simulated": True
        }

    except requests.exceptions.Timeout:
        logger.error("[Confirm] Backend request timed out")
        return {
            "success": False,
            "message": "❌ Connection timed out. Please try again."
        }

    except Exception as e:
        logger.error(f"[Confirm] Unexpected error: {str(e)}")
        return {
            "success": False,
            "message": f"❌ Failed to confirm location: {str(e)}"
        }


# Create the FunctionTool
confirm_location_tool = FunctionTool(confirm_location)
