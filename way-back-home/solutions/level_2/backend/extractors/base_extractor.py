from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class EntityType(Enum):
    SURVIVOR = "Survivor"
    SKILL = "Skill"
    NEED = "Need"
    RESOURCE = "Resource"
    BIOME = "Biome"
    BROADCAST = "Broadcast"

class RelationshipType(Enum):
    HAS_SKILL = "SurvivorHasSkill"
    HAS_NEED = "SurvivorHasNeed"
    FOUND_RESOURCE = "SurvivorFoundResource"
    IN_BIOME = "SurvivorInBiome"
    CAN_HELP = "SurvivorCanHelp"
    TREATS = "SkillTreatsNeed"

@dataclass
class ExtractedEntity:
    """Entity extracted from media - maps to your node tables"""
    entity_type: EntityType
    name: str
    properties: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "entity_type": self.entity_type.value,
            "name": self.name,
            "properties": self.properties,
            "confidence": self.confidence
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExtractedEntity':
        return cls(
            entity_type=EntityType(data['entity_type']),
            name=data['name'],
            properties=data.get('properties', {}),
            confidence=data.get('confidence', 1.0)
        )

@dataclass
class ExtractedRelationship:
    """Relationship extracted - maps to your edge tables"""
    relationship_type: RelationshipType
    source_name: str  # Name of source entity
    target_name: str  # Name of target entity
    properties: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "relationship_type": self.relationship_type.value,
            "source": self.source_name,
            "target": self.target_name,
            "properties": self.properties,
            "confidence": self.confidence
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExtractedRelationship':
        return cls(
            relationship_type=RelationshipType(data['relationship_type']),
            source_name=data['source'],
            target_name=data['target'],
            properties=data.get('properties', {}),
            confidence=data.get('confidence', 1.0)
        )

@dataclass
class ExtractionResult:
    """Complete extraction result from any media"""
    media_uri: str
    media_type: str
    entities: List[ExtractedEntity] = field(default_factory=list)
    relationships: List[ExtractedRelationship] = field(default_factory=list)
    raw_content: str = ""
    summary: str = ""
    broadcast_info: Optional[Dict[str, Any]] = None  # For creating Broadcast node
    metadata: Dict[str, Any] = field(default_factory=dict)
    extracted_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "media_uri": self.media_uri,
            "media_type": self.media_type,
            "entities": [e.to_dict() for e in self.entities],
            "relationships": [r.to_dict() for r in self.relationships],
            "raw_content": self.raw_content,
            "summary": self.summary,
            "broadcast_info": self.broadcast_info,
            "metadata": self.metadata,
            "extracted_at": self.extracted_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ExtractionResult':
        return cls(
            media_uri=data['media_uri'],
            media_type=data['media_type'],
            entities=[ExtractedEntity.from_dict(e) for e in data.get('entities', [])],
            relationships=[ExtractedRelationship.from_dict(r) for r in data.get('relationships', [])],
            raw_content=data.get('raw_content', ""),
            summary=data.get('summary', ""),
            broadcast_info=data.get('broadcast_info'),
            metadata=data.get('metadata', {}),
            extracted_at=datetime.fromisoformat(data['extracted_at']) if 'extracted_at' in data else datetime.utcnow()
        )

class BaseExtractor(ABC):
    """Base class for media extractors"""
    
    @abstractmethod
    async def extract(self, gcs_uri: str, **kwargs) -> ExtractionResult:
        pass
