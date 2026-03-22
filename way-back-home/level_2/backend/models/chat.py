from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    attachments: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    answer: str
    gql_query: Optional[str] = None
    nodes_to_highlight: List[str] = []
    edges_to_highlight: List[str] = []
    suggested_followups: List[str] = []
