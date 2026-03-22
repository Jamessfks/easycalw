from fastapi import APIRouter, Depends
from models.graph import GraphData
from services.graph_service import GraphService
from services.spanner_service import SpannerService

router = APIRouter(prefix="/api/graph", tags=["graph"])

# Dependency Injection (Simple Manual for now)
def get_graph_service():
    spanner = SpannerService()
    return GraphService(spanner)

@router.get("", response_model=GraphData)
async def get_graph(service: GraphService = Depends(get_graph_service)):
    return await service.get_full_graph()
