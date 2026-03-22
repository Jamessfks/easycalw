"""
Level 1: Mission Analysis AI - Root Agent

This is the main orchestrator agent that coordinates crash site analysis
to confirm the explorer's location and activate the rescue beacon.

Architecture:
- Root Agent (MissionAnalysisAI): Coordinates and synthesizes
  - Uses before_agent_callback to fetch participant config and set state
  - State is automatically shared with all sub-agents via InvocationContext
- ParallelAgent (EvidenceAnalysisCrew): Runs 3 specialists concurrently
  - GeologicalAnalyst: Soil sample analysis (uses {soil_url} from state)
  - BotanicalAnalyst: Flora recording analysis (uses {flora_url} from state)
  - AstronomicalAnalyst: Star field triangulation (uses {stars_url} from state)

Key ADK Pattern: before_agent_callback + {key} State Templating
- The callback runs ONCE when the agent starts processing
- It fetches participant data from the backend API
- It sets state values that sub-agents access via {key} templating
- No config file reading needed - works locally AND deployed
"""

import os
import logging
import httpx

from google.adk.agents import Agent, ParallelAgent
from google.adk.agents.callback_context import CallbackContext

# Import specialist agents
from agent.agents.geological_analyst import geological_analyst
from agent.agents.botanical_analyst import botanical_analyst
from agent.agents.astronomical_analyst import astronomical_analyst

# Import confirmation tool
from agent.tools.confirm_tools import confirm_location_tool

logger = logging.getLogger(__name__)


# =============================================================================
# BEFORE AGENT CALLBACK - Fetches config and sets state
# =============================================================================
# This callback runs BEFORE the agent processes any request.
# It fetches participant configuration from the backend API and
# sets state values that all sub-agents can access via {key} templating.

async def setup_participant_context(callback_context: CallbackContext) -> None:
    """
    Fetch participant configuration and populate state for all agents.

    This callback:
    1. Reads PARTICIPANT_ID and BACKEND_URL from environment
    2. Fetches participant data from the backend API
    3. Sets state values: soil_url, flora_url, stars_url, username, x, y, etc.
    4. Returns None to continue normal agent execution

    The state is automatically shared with all sub-agents because they
    share the same InvocationContext.
    """
    # Get configuration from environment variables
    participant_id = os.environ.get("PARTICIPANT_ID", "")
    backend_url = os.environ.get("BACKEND_URL", "https://api.waybackhome.dev")
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "")

    logger.info(f"[Callback] Setting up context for participant: {participant_id}")

    # Set project_id and backend_url in state immediately
    callback_context.state["project_id"] = project_id
    callback_context.state["backend_url"] = backend_url
    callback_context.state["participant_id"] = participant_id

    if not participant_id:
        logger.warning("[Callback] No PARTICIPANT_ID set - using placeholder values")
        # Set placeholder values so agent can still respond
        callback_context.state["username"] = "Explorer"
        callback_context.state["x"] = 0
        callback_context.state["y"] = 0
        callback_context.state["soil_url"] = "Not available - set PARTICIPANT_ID"
        callback_context.state["flora_url"] = "Not available - set PARTICIPANT_ID"
        callback_context.state["stars_url"] = "Not available - set PARTICIPANT_ID"
        return None

    # Fetch participant data from backend API
    try:
        url = f"{backend_url}/participants/{participant_id}"
        logger.info(f"[Callback] Fetching from: {url}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

        # Extract evidence URLs
        evidence_urls = data.get("evidence_urls", {})

        # Set all state values for sub-agents to access
        callback_context.state["username"] = data.get("username", "Explorer")
        callback_context.state["x"] = data.get("x", 0)
        callback_context.state["y"] = data.get("y", 0)
        callback_context.state["soil_url"] = evidence_urls.get("soil", "Not available")
        callback_context.state["flora_url"] = evidence_urls.get("flora", "Not available")
        callback_context.state["stars_url"] = evidence_urls.get("stars", "Not available")

        logger.info(f"[Callback] State populated for {data.get('username')}")
        logger.info(f"[Callback] Evidence URLs: soil={bool(evidence_urls.get('soil'))}, "
                   f"flora={bool(evidence_urls.get('flora'))}, stars={bool(evidence_urls.get('stars'))}")

    except httpx.HTTPStatusError as e:
        logger.error(f"[Callback] HTTP error fetching participant: {e}")
        # Set error state
        callback_context.state["username"] = "Explorer"
        callback_context.state["x"] = 0
        callback_context.state["y"] = 0
        callback_context.state["soil_url"] = f"Error: {e}"
        callback_context.state["flora_url"] = f"Error: {e}"
        callback_context.state["stars_url"] = f"Error: {e}"

    except Exception as e:
        logger.error(f"[Callback] Error fetching participant config: {e}")
        # Set error state
        callback_context.state["username"] = "Explorer"
        callback_context.state["x"] = 0
        callback_context.state["y"] = 0
        callback_context.state["soil_url"] = f"Error: {e}"
        callback_context.state["flora_url"] = f"Error: {e}"
        callback_context.state["stars_url"] = f"Error: {e}"

    # Return None to continue normal execution
    return None


# =============================================================================
# PARALLEL ANALYSIS CREW
# =============================================================================
# The three specialist agents run in PARALLEL because their analyses
# are independent - soil analysis doesn't need flora results, etc.
#
# ParallelAgent automatically shares state with all sub-agents.

evidence_analysis_crew = ParallelAgent(
    name="EvidenceAnalysisCrew",
    description="Runs geological, botanical, and astronomical analysis in parallel to classify the planetary biome.",
    sub_agents=[geological_analyst, botanical_analyst, astronomical_analyst]
)


# =============================================================================
# ROOT ORCHESTRATOR
# =============================================================================
# The root agent:
# 1. Uses before_agent_callback to fetch participant config
# 2. Coordinates the parallel analysis crew
# 3. Synthesizes results using 2-of-3 agreement
# 4. Confirms location to activate the beacon
#
# IMPORTANT: The instruction uses {key} templating, NOT f-strings!
# These placeholders are replaced at runtime with values from state.

root_agent = Agent(
    name="MissionAnalysisAI",
    model="gemini-2.5-flash",
    description="Coordinates crash site analysis to confirm explorer location and activate rescue beacon.",
    instruction="""You are the Mission Analysis AI coordinating a rescue operation for a stranded space explorer.

## Explorer Information
- Name: {username}
- Coordinates: ({x}, {y})

## Evidence URLs (these are automatically provided to the specialists)
- Soil sample: {soil_url}
- Flora recording: {flora_url}
- Star field: {stars_url}

## Your Workflow

### STEP 1: DELEGATE TO ANALYSIS CREW
Tell the EvidenceAnalysisCrew to analyze all the evidence.
The evidence URLs are already available to the specialists via shared state.

The crew will run three specialists IN PARALLEL:
- GeologicalAnalyst: Analyzes soil sample
- BotanicalAnalyst: Analyzes flora recording (video + audio)
- AstronomicalAnalyst: Analyzes star field and queries star catalog

### STEP 2: COLLECT RESULTS
Each specialist will report their biome classification in this format:
- "GEOLOGICAL ANALYSIS: [BIOME] (confidence: X%)"
- "BOTANICAL ANALYSIS: [BIOME] (confidence: X%)"
- "ASTRONOMICAL ANALYSIS: [BIOME] in [QUADRANT] quadrant (confidence: X%)"

### STEP 3: APPLY 2-OF-3 AGREEMENT RULE
Determine the final biome:
- If 2 or 3 specialists agree on the biome → that's the answer
- If all 3 disagree → use your judgment based on confidence scores
- Weight higher confidence scores more heavily

### STEP 4: CONFIRM LOCATION
Call the confirm_location tool with the determined biome.
This validates the analysis and activates the rescue beacon!

The tool takes ONE argument:
- biome: The determined biome (CRYO, VOLCANIC, BIOLUMINESCENT, or FOSSILIZED)

## Biome Reference
| Biome | Quadrant | Key Characteristics |
|-------|----------|---------------------|
| CRYO | Northwest (NW) | Frozen, blue, ice crystals, frost ferns, blue giant stars |
| VOLCANIC | Northeast (NE) | Magma, red/orange, obsidian, fire blooms, red dwarf stars |
| BIOLUMINESCENT | Southwest (SW) | Glowing, purple/green, phosphorescent, fungi, green pulsars |
| FOSSILIZED | Southeast (SE) | Amber, golden, ancient, petrified trees, yellow suns |

## Response Style
- Be encouraging and narrative - this is a survival situation!
- Build suspense during the analysis phase
- Explain the 2-of-3 agreement as you synthesize
- Celebrate enthusiastically when the beacon activates!
""",
    sub_agents=[evidence_analysis_crew],
    tools=[confirm_location_tool],
    before_agent_callback=setup_participant_context
)


# =============================================================================
# A2A WRAPPER FOR CLOUD RUN DEPLOYMENT
# =============================================================================
# When deployed to Cloud Run, this exposes the agent via the A2A protocol,
# allowing other agents to communicate with it.

if __name__ == "__main__":
    import uvicorn
    from google.adk.a2a import to_a2a

    # Get configuration
    PUBLIC_URL = os.environ.get("PUBLIC_URL", "http://localhost:8080")
    PARTICIPANT_ID = os.environ.get("PARTICIPANT_ID", "")

    print(f"\n{'='*60}")
    print(f"Mission Analysis AI starting...")
    print(f"{'='*60}")
    print(f"Participant ID: {PARTICIPANT_ID or '(not set)'}")
    print(f"A2A endpoint: {PUBLIC_URL}")
    print(f"Agent Card: {PUBLIC_URL}/.well-known/agent.json")
    print(f"{'='*60}\n")

    # Create A2A-wrapped application
    a2a_app = to_a2a(root_agent, port=8080, public_url=PUBLIC_URL)

    # Start server
    uvicorn.run(a2a_app, host="0.0.0.0", port=8080)
