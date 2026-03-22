import json
import logging
import os
from typing import List, Optional
from google import genai
from google.genai import types
from .base_extractor import (
    BaseExtractor, ExtractionResult, ExtractedEntity, 
    ExtractedRelationship, EntityType, RelationshipType
)
from services.gcs_service import GCSService
import os

logger = logging.getLogger(__name__)

class TextExtractor(BaseExtractor):
    """Extract survivor network entities from text content"""
    
    def __init__(self):
        # Initialize GenAI Client
        # It picks up GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_API_KEY from env
        self.client = genai.Client(
            vertexai=True, 
            project=os.getenv('PROJECT_ID'), 
            location=os.getenv('REGION')
        )
        self.model_name = 'gemini-2.5-flash' # Using flash for speed/cost.
        # Note: 'gemini-2.5-flash' mentioned in user prompt might not be available yet publicly, 
        # sticking to a known model or the user's string if appropriate. 
        # User prompt had gemini-2.5-flash. 
        # Actually, let's try to use what they asked but fallback if needed. 
        # 'gemini-2.5-flash' is safe.
        
        self.gcs_service = GCSService()
        
    def _get_extraction_prompt(self, text: str) -> str:
        return f"""Analyze this text and extract information for a Survivor Network database.

## Entity Types to Extract:

1. **Survivor**: People in the network
   - Properties: name (required), callsign, role, status (active/inactive/unknown), 
     biome, quadrant, description

2. **Skill**: Abilities/expertise
   - Properties: name (required), category (medical/technical/survival/communication/leadership), 
     description

3. **Need**: Requirements/requests for help
   - Properties: description (required), category (medical/food/shelter/rescue/equipment), 
     urgency (critical/high/medium/low)

4. **Resource**: Available items/supplies
   - Properties: name (required), type (food/water/medical/tools/shelter/vehicle), 
     description, biome

5. **Biome**: Geographic areas
   - Properties: name (required), quadrant (NE/NW/SE/SW), description

## Relationships to Identify:

1. **SurvivorHasSkill**: Survivor -> Skill (proficiency: beginner/intermediate/expert)
2. **SurvivorHasNeed**: Survivor -> Need (status: active/resolved/pending)
3. **SurvivorFoundResource**: Survivor -> Resource (found_at: timestamp description)
4. **SurvivorInBiome**: Survivor -> Biome
5. **SurvivorCanHelp**: Survivor -> Survivor (reason, match_score 0-1)
6. **SkillTreatsNeed**: Skill -> Need (effectiveness: low/medium/high)

## Text to Analyze:
{text[:8000]}

## Return JSON (no markdown):
{{
    "summary": "Brief summary of the content",
    "entities": [
        {{
            "entity_type": "Survivor|Skill|Need|Resource|Biome",
            "name": "entity name",
            "properties": {{"key": "value"}},
            "confidence": 0.0-1.0
        }}
    ],
    "relationships": [
        {{
            "relationship_type": "SurvivorHasSkill|SurvivorHasNeed|SurvivorFoundResource|SurvivorInBiome|SurvivorCanHelp|SkillTreatsNeed",
            "source": "source entity name",
            "target": "target entity name",
            "properties": {{}},
            "confidence": 0.0-1.0
        }}
    ],
    "broadcast_info": {{
        "title": "suggested title for this content",
        "broadcast_type": "report|alert|request|update"
    }}
}}"""

    async def extract(self, gcs_uri: str, text_content: str = None) -> ExtractionResult:
        """Extract entities from text"""
        try:
            # Get text content if not provided
            if not text_content:
                text_content = self.gcs_service.read_text_content(gcs_uri)
            
            # Call Gemini
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=self._get_extraction_prompt(text_content),
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Parse JSON response
            try:
                result_json = json.loads(response.text)
            except json.JSONDecodeError:
                # Fallback if JSON mode didn't work perfectly (rare with response_mime_type)
                text = response.text.strip()
                if text.startswith('```json'): # Common markdown wrapper
                    text = text[7:-3]
                elif text.startswith('```'):
                    text = text[3:-3]
                result_json = json.loads(text)
            
            # Convert to typed entities
            entities = []
            for e in result_json.get('entities', []):
                try:
                    entity_type = EntityType(e['entity_type'])
                    entities.append(ExtractedEntity(
                        entity_type=entity_type,
                        name=e['name'],
                        properties=e.get('properties', {}),
                        confidence=e.get('confidence', 0.8)
                    ))
                except (ValueError, KeyError) as ex:
                    logger.warning(f"Skipping invalid entity: {e}, error: {ex}")
            
            # Convert to typed relationships
            relationships = []
            for r in result_json.get('relationships', []):
                try:
                    rel_type = RelationshipType(r['relationship_type'])
                    relationships.append(ExtractedRelationship(
                        relationship_type=rel_type,
                        source_name=r['source'],
                        target_name=r['target'],
                        properties=r.get('properties', {}),
                        confidence=r.get('confidence', 0.8)
                    ))
                except (ValueError, KeyError) as ex:
                    logger.warning(f"Skipping invalid relationship: {r}, error: {ex}")
            
            return ExtractionResult(
                media_uri=gcs_uri,
                media_type="text",
                entities=entities,
                relationships=relationships,
                raw_content=text_content[:1000],  # Store preview
                summary=result_json.get('summary', ''),
                broadcast_info=result_json.get('broadcast_info'),
                metadata={'word_count': len(text_content.split())}
            )
            
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            raise
