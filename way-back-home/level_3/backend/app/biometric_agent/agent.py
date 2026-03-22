import os
from google.adk.agents import Agent
from typing import List, Optional, Callable, Dict, Any
from dotenv import load_dotenv

load_dotenv()


#REPLACE TOOLS

#REPLACE_MODEL

root_agent = Agent(
    name="biometric_agent",
    model=MODEL_ID,
    #TOOL CONFIG,
    instruction="""
    #REPLACE INSTRUCTIONS
    """
)
