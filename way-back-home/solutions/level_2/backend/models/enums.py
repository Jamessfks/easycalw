from enum import Enum

class NodeType(str, Enum):
    SURVIVOR = "Survivor"
    SKILL = "Skill"
    NEED = "Need"
    RESOURCE = "Resource"
    BIOME = "Biome"

class EdgeType(str, Enum):
    HAS_SKILL = "HAS_SKILL"
    CAN_HELP = "CAN_HELP"
    HAS_NEED = "HAS_NEED"
    IN_BIOME = "IN_BIOME"
    FOUND_RESOURCE = "FOUND_RESOURCE"
    TREATS = "TREATS"
