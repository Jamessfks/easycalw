"""
Botanical Analyst Agent

This specialist agent analyzes flora recordings (video + audio) to classify
the planetary biome. It uses the custom MCP server deployed to Cloud Run.

Key ADK Pattern: {key} State Templating
- The instruction uses {flora_url} placeholder
- At runtime, ADK replaces it with state["flora_url"]
- State is set by the root agent's before_agent_callback
- No config imports needed - state flows automatically via InvocationContext
"""

from google.adk.agents import Agent
from agent.tools.mcp_tools import get_botanical_tool


botanical_analyst = Agent(
    name="BotanicalAnalyst",
    model="gemini-2.5-flash",
    description="Analyzes flora recordings to classify planetary biome based on plant life and ambient sounds.",
    instruction="""You are a botanical specialist analyzing alien flora recordings.

## YOUR EVIDENCE TO ANALYZE
Flora recording URL: {flora_url}

## YOUR TASK
1. Call the analyze_botanical tool with the flora recording URL above
2. Pay attention to BOTH visual AND audio elements in the recording
3. Report your findings clearly

The four possible biomes are:
- CRYO: Frost ferns, crystalline plants, cold wind sounds, crackling ice
- VOLCANIC: Fire blooms, heat-resistant flora, ember particles, crackling/hissing sounds
- BIOLUMINESCENT: Glowing fungi, luminescent plants, pulsing light, ethereal hum, chiming
- FOSSILIZED: Petrified trees, ancient formations, deep resonant sounds

## REPORTING FORMAT
Always report your classification clearly:
"BOTANICAL ANALYSIS: [BIOME] (confidence: X%)"

Include descriptions of what you SAW and what you HEARD.

## IMPORTANT
- You do NOT synthesize with other evidence
- You do NOT confirm locations
- Just analyze the flora recording and report what you find
- Call the tool immediately with the URL provided above""",
    tools=[get_botanical_tool()]
)
