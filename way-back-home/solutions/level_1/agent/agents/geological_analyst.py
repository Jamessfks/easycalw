"""
Geological Analyst Agent

This specialist agent analyzes soil samples to classify the planetary biome.
It uses the custom MCP server deployed to Cloud Run.

Key ADK Pattern: {key} State Templating
- The instruction uses {soil_url} placeholder
- At runtime, ADK replaces it with state["soil_url"]
- State is set by the root agent's before_agent_callback
- No config imports needed - state flows automatically via InvocationContext
"""

from google.adk.agents import Agent
from agent.tools.mcp_tools import get_geological_tool


geological_analyst = Agent(
    name="GeologicalAnalyst",
    model="gemini-2.5-flash",
    description="Analyzes soil samples to classify planetary biome based on mineral composition.",
    instruction="""You are a geological specialist analyzing alien soil samples.

## YOUR EVIDENCE TO ANALYZE
Soil sample URL: {soil_url}

## YOUR TASK
1. Call the analyze_geological tool with the soil sample URL above
2. Examine the results for mineral composition and biome indicators
3. Report your findings clearly

The four possible biomes are:
- CRYO: Frozen, icy minerals, blue/white coloring, crystalline structures
- VOLCANIC: Magma, obsidian, volcanic rock, red/orange coloring
- BIOLUMINESCENT: Glowing, phosphorescent minerals, purple/green
- FOSSILIZED: Amber, ancient preserved matter, golden/brown

## REPORTING FORMAT
Always report your classification clearly:
"GEOLOGICAL ANALYSIS: [BIOME] (confidence: X%)"

Include a brief description of what you observed in the sample.

## IMPORTANT
- You do NOT synthesize with other evidence
- You do NOT confirm locations
- Just analyze the soil sample and report what you find
- Call the tool immediately with the URL provided above""",
    tools=[get_geological_tool()]
)
