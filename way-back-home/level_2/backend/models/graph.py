from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from .enums import NodeType, EdgeType

class Node(BaseModel):
    id: str
    type: NodeType
    label: str
    properties: Dict[str, Any]
    color: Optional[str] = None
    icon: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    biome: Optional[str] = None

class Edge(BaseModel):
    id: str
    source: str
    target: str
    type: EdgeType
    properties: Dict[str, Any]
    label: Optional[str] = None

class GraphData(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class GraphQueryRequest(BaseModel):
    query: str

class GraphQueryResponse(BaseModel):
    data: GraphData
    query_executed: str
    execution_time_ms: float
