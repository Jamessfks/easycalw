import json
import logging
import os
import time
from google import genai
from google.genai import types
from .base_extractor import (
    BaseExtractor, ExtractionResult, ExtractedEntity,
    ExtractedRelationship, EntityType, RelationshipType
)
from services.gcs_service import GCSService
import os

logger = logging.getLogger(__name__)

class VideoExtractor(BaseExtractor):
    """Extract survivor network entities from video content"""
    
    def __init__(self):
        self.client = genai.Client(
            vertexai=True,
            project=os.getenv('PROJECT_ID'),
            location=os.getenv('REGION')
        )
        self.model_name = 'gemini-2.5-flash'
        self.gcs_service = GCSService()
    
    def _get_extraction_prompt(self) -> str:
        return """Analyze this video for a Survivor Network emergency response system.

Watch the entire video and identify:

## Timeline Analysis:
- Key events and when they occur
- Changes in situation over time

## Extract:

1. **Survivors/People**:
   - Names mentioned, roles, conditions
   - Actions and interactions

2. **Resources**:
   - Items shown or mentioned
   - Locations of supplies

3. **Skills demonstrated**:
   - Medical procedures, technical work, leadership
   - Who performs what

4. **Needs identified**:
   - Requests for help
   - Urgent situations

5. **Location/Biome**:
   - Environment type
   - Geographic clues

6. **Spoken content**:
   - Key messages
   - Names, locations, instructions mentioned

## Return JSON (no markdown):
{
    "summary": "Overall video summary",
    "duration_estimate": "estimated length",
    "key_moments": [
        {"time": "approximate timestamp", "event": "description"}
    ],
    "transcript_summary": "key spoken content",
    "entities": [
        {
            "entity_type": "Survivor|Skill|Need|Resource|Biome",
            "name": "entity name",
            "properties": {
                "description": "details",
                "first_seen": "when in video"
            },
            "confidence": 0.0-1.0
        }
    ],
    "relationships": [
        {
            "relationship_type": "SurvivorHasSkill|SurvivorHasNeed|SurvivorFoundResource|SurvivorInBiome|SurvivorCanHelp|SkillTreatsNeed",
            "source": "source entity",
            "target": "target entity",
            "properties": {},
            "confidence": 0.0-1.0
        }
    ],
    "broadcast_info": {
        "title": "suggested title",
        "broadcast_type": "report|alert|request|update",
        "duration_seconds": estimated_duration_in_seconds
    },
    "urgency_level": "critical|high|medium|low"
}"""

    async def extract(self, gcs_uri: str, **kwargs) -> ExtractionResult:
        """Extract entities from video"""
        temp_path = None
        video_file = None
        
        try:
            # Download video to temp
            temp_path = self.gcs_service.download_to_temp(gcs_uri)
            
            # Upload to Gemini File API
            logger.info(f"Uploading video to Gemini for processing...")
            video_file = self.client.files.upload(path=temp_path)
            
            # Wait for processing
            while video_file.state == types.FileState.PROCESSING:
                logger.info("Video processing...")
                time.sleep(5)
                video_file = self.client.files.get(name=video_file.name)
            
            if video_file.state == types.FileState.FAILED:
                raise Exception("Video processing failed in Gemini")
            
            # Analyze with Gemini
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    self._get_extraction_prompt(),
                    video_file
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            # Parse response
            try:
                result_json = json.loads(response.text)
            except json.JSONDecodeError:
                # Fallback
                text = response.text.strip()
                if text.startswith('```json'):
                    text = text[7:-3]
                elif text.startswith('```'):
                    text = text[3:-3]
                result_json = json.loads(text)
            
            # Convert entities
            entities = []
            for e in result_json.get('entities', []):
                try:
                    entities.append(ExtractedEntity(
                        entity_type=EntityType(e['entity_type']),
                        name=e['name'],
                        properties=e.get('properties', {}),
                        confidence=e.get('confidence', 0.8)
                    ))
                except (ValueError, KeyError):
                    continue
            
            # Convert relationships
            relationships = []
            for r in result_json.get('relationships', []):
                try:
                    relationships.append(ExtractedRelationship(
                        relationship_type=RelationshipType(r['relationship_type']),
                        source_name=r['source'],
                        target_name=r['target'],
                        properties=r.get('properties', {}),
                        confidence=r.get('confidence', 0.8)
                    ))
                except (ValueError, KeyError):
                    continue
            
            # Enhanced broadcast info for video
            broadcast_info = result_json.get('broadcast_info', {})
            broadcast_info['transcript'] = result_json.get('transcript_summary', '')
            
            return ExtractionResult(
                media_uri=gcs_uri,
                media_type="video",
                entities=entities,
                relationships=relationships,
                raw_content=result_json.get('transcript_summary', ''),
                summary=result_json.get('summary', ''),
                broadcast_info=broadcast_info,
                metadata={
                    'duration_estimate': result_json.get('duration_estimate'),
                    'key_moments': result_json.get('key_moments', []),
                    'urgency_level': result_json.get('urgency_level')
                }
            )
            
        except Exception as e:
            logger.error(f"Video extraction failed: {e}")
            raise
        finally:
            # Cleanup
            if video_file:
                try:
                    pass 
                    # Note: We might want to delete the file, but client.files.delete is the method. 
                    # If using Vertex AI, file management is different. 
                    # Standard genai client uses `client.files.delete(name=...)`
                    # Since we used `upload`, we should probably delete it.
                    # However, leaving it temporarily is fine if we are unsure about SDK method signature
                    # for Vertex. But usually it's client.files.delete(name=video_file.name).
                    # Let's try it.
                    self.client.files.delete(name=video_file.name)
                except Exception as e:
                     logger.warning(f"Failed to delete remote file: {e}")
            
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
