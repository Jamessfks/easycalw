
import os
import logging
from dotenv import load_dotenv
import vertexai
from vertexai.preview import reasoning_engines

# Import class-based types for Memory Bank
from vertexai import types
from google.genai import types as genai_types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION", "us-central1")
AGENT_DISPLAY_NAME = "survivor_network_agent_engine"

if not PROJECT_ID:
    raise ValueError("PROJECT_ID not found in environment variables.")

# Basic configuration types
MemoryBankConfig = types.ReasoningEngineContextSpecMemoryBankConfig
SimilaritySearchConfig = (
    types.ReasoningEngineContextSpecMemoryBankConfigSimilaritySearchConfig
)
GenerationConfig = types.ReasoningEngineContextSpecMemoryBankConfigGenerationConfig

# Advanced configuration types
CustomizationConfig = types.MemoryBankCustomizationConfig
MemoryTopic = types.MemoryBankCustomizationConfigMemoryTopic
CustomMemoryTopic = types.MemoryBankCustomizationConfigMemoryTopicCustomMemoryTopic
GenerateMemoriesExample = types.MemoryBankCustomizationConfigGenerateMemoriesExample
ConversationSource = (
    types.MemoryBankCustomizationConfigGenerateMemoriesExampleConversationSource
)
ConversationSourceEvent = (
    types.MemoryBankCustomizationConfigGenerateMemoriesExampleConversationSourceEvent
)
ExampleGeneratedMemory = (
    types.MemoryBankCustomizationConfigGenerateMemoriesExampleGeneratedMemory
)
Content = genai_types.Content
Part = genai_types.Part

def register_agent_engine():
    """
    Registers an Agent Engine resource in Vertex AI to enable Sessions and Memory Bank.
    This does NOT deploy the agent code to the cloud.
    """
    logger.info(f"Initializing Vertex AI for project: {PROJECT_ID}, location: {LOCATION}")
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    client = vertexai.Client(project=PROJECT_ID, location=LOCATION)

    # --- Define Custom Topics ---
    logger.info("Defining custom topics...")
    
    # TODO: SET_UP_TOPIC

    # --- Define Few-Shot Examples ---
    logger.info("Defining few-shot examples...")
    
    few_shot_examples = [
        GenerateMemoriesExample(
            conversation_source=ConversationSource(
                events=[
                    ConversationSourceEvent(
                        content=Content(
                            role="user",
                            parts=[Part(text="Find me someone who knows how to treat wounds. I prefer looking for concepts not just keywords.")]
                        )
                    ),
                    ConversationSourceEvent(
                        content=Content(
                            role="model",
                            parts=[Part(text="I'll use semantic search to find survivors with wound treatment skills.")]
                        )
                    ),
                    ConversationSourceEvent(
                        content=Content(
                            role="user",
                            parts=[Part(text="Great. Also, keep an eye out for anyone near the Old Hospital.")]
                        )
                    )
                ]
            ),
            generated_memories=[
                ExampleGeneratedMemory(fact="User prefers semantic search for skills"),
                ExampleGeneratedMemory(fact="User is interested in survivors near the Old Hospital"),
                ExampleGeneratedMemory(fact="User is looking for wound treatment skills")
            ]
        ),
        GenerateMemoriesExample(
            conversation_source=ConversationSource(
                events=[
                    ConversationSourceEvent(
                        content=Content(
                            role="user",
                            parts=[Part(text="What are the most urgent needs right now?")]
                        )
                    ),
                    ConversationSourceEvent(
                        content=Content(
                            role="model",
                            parts=[Part(text="The most urgent needs are Food in Sector 7 and Medical Supplies in the Bunker.")]
                        )
                    ),
                    ConversationSourceEvent(
                        content=Content(
                            role="user",
                            parts=[Part(text="Okay, prioritize Food. We need to solve that first.")]
                        )
                    )
                ]
            ),
            generated_memories=[
                ExampleGeneratedMemory(fact="User requested to prioritize Food needs"),
                ExampleGeneratedMemory(fact="User checked for urgent needs in Sector 7 and Bunker")
            ]
        )
    ]

    # --- Create Customization Config ---
    customization_config = CustomizationConfig(
        memory_topics=custom_topics,
        generate_memories_examples=few_shot_examples
    )

    logger.info(f"Creating/Registering Agent Engine: {AGENT_DISPLAY_NAME}")
    
    # Create Agent Engine with Memory Bank configuration
    agent_engine = client.agent_engines.create(
        config={
            "display_name": AGENT_DISPLAY_NAME,
            "context_spec": {
                "memory_bank_config": {
                    "generation_config": {
                        "model": f"projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/gemini-2.5-flash"
                    },
                    "customization_configs": [customization_config]
                }
            },
        }
    )

    agent_engine_id = agent_engine.api_resource.name.split("/")[-1]
    logger.info("✅ Agent Engine Registered Successfully!")
    logger.info(f"Agent Engine ID: {agent_engine_id}")
    logger.info("\nIMPORTANT: Add the following line to your backend/.env file:")
    logger.info(f"AGENT_ENGINE_ID={agent_engine_id}")

if __name__ == "__main__":
    try:
        register_agent_engine()
    except Exception as e:
        logger.error(f"Failed to register Agent Engine: {e}")
