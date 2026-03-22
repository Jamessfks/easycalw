from dataclasses import dataclass
from enum import Enum
from typing import Set

class MediaType(Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"

@dataclass 
class ExtractionConfig:
    TEXT_EXTENSIONS: Set[str] = frozenset({'.txt', '.md', '.json', '.csv', '.log'})
    IMAGE_EXTENSIONS: Set[str] = frozenset({'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'})
    VIDEO_EXTENSIONS: Set[str] = frozenset({'.mp4', '.avi', '.mov', '.mkv', '.webm', '.m4v'})
    AUDIO_EXTENSIONS: Set[str] = frozenset({'.mp3', '.wav', '.flac', '.m4a', '.ogg'})
    
    # Schema entity types
    NODE_TYPES = ['Survivor', 'Skill', 'Need', 'Resource', 'Biome', 'Broadcast']
    
    # Schema relationship types
    EDGE_TYPES = [
        'SurvivorHasSkill',
        'SurvivorHasNeed', 
        'SurvivorFoundResource',
        'SurvivorInBiome',
        'SurvivorCanHelp',
        'SkillTreatsNeed'
    ]
