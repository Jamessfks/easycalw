from typing import List, Optional
from models.chat import ChatRequest, ChatResponse
from services.gql_builder import GQLBuilder
from services.graph_service import GraphService
# from google.cloud import aiplatform 
# import vertexai.preview.generative_models as generative_models

class ChatService:
    def __init__(self, gql_builder: GQLBuilder, graph_service: GraphService):
        self.gql_builder = gql_builder
        self.graph_service = graph_service

    async def process_message(self, request: ChatRequest) -> ChatResponse:
        # 1. Use LLM to understand intent and entities (Mocking for now)
        user_msg = request.message.lower()
        
        # Simple rule-based mock for demo
        if "help" in user_msg and "tanaka" in user_msg:
             return ChatResponse(
                 answer="Dr. Frost can help Captain Tanaka! She has Medical Training which can treat burns with HIGH effectiveness.",
                 gql_query=self.gql_builder.build_help_query("Tanaka", "Burns"),
                 nodes_to_highlight=["n1", "n3", "n4", "n2"], # Frost, Medical, Burns, Tanaka (IDs from graph_service mock)
                 edges_to_highlight=["e1", "e3", "e2"]
             )
        
        return ChatResponse(
            answer="I can help you analyze the survivor network. Try asking 'Who can help Tanaka?'"
        )
