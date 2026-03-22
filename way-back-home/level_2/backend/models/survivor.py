from pydantic import BaseModel
from typing import Optional, List

class Survivor(BaseModel):
    id: str
    name: str
    role: str
    biome: str
    status: str
    skills: List[str] = []
    needs: List[str] = []
