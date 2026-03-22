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

This is the PLACEHOLDER VERSION. Follow the codelab instructions
to fill in the #REPLACE sections.
"""


# =============================================================================
# PARALLEL ANALYSIS CREW
# =============================================================================
# The three specialist agents run in PARALLEL because their analyses
# are independent - soil analysis doesn't need flora results, etc.
#
# This is faster (~3s) than sequential execution (~9s) and more accurate
# to how real scientific teams work.

#REPLACE-PARALLEL-CREW


# =============================================================================
# ROOT ORCHESTRATOR
# =============================================================================
# The root agent coordinates the analysis crew, synthesizes their results
# using 2-of-3 agreement, and confirms the location to activate the beacon.

#REPLACE-ROOT-ORCHESTRATOR