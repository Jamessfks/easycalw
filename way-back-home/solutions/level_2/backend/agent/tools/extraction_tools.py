import os
import logging
from typing import Dict, Any, Optional
from services.gcs_service import GCSService
from services.spanner_graph_service import SpannerGraphService
from extractors.text_extractor import TextExtractor
from extractors.image_extractor import ImageExtractor
from extractors.video_extractor import VideoExtractor
from config import MediaType

logger = logging.getLogger(__name__)

# Initialize singletons
gcs_service = GCSService()
spanner_service = SpannerGraphService()
text_extractor = TextExtractor()
image_extractor = ImageExtractor()
video_extractor = VideoExtractor()


def upload_media(file_path: str, survivor_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Upload media file to GCS and detect its type.
    
    Args:
        file_path: Path to the local file
        survivor_id: Optional survivor ID to associate with upload
        
    Returns:
        Dict with gcs_uri, media_type, and status
    """
    try:
        if not file_path:
            return {"status": "error", "error": "No file path provided"}
        
        # Strip quotes if present
        file_path = file_path.strip().strip("'").strip('"')
        
        if not os.path.exists(file_path):
            return {"status": "error", "error": f"File not found: {file_path}"}
        
        gcs_uri, media_type, signed_url = gcs_service.upload_file(file_path, survivor_id)
        
        return {
            "status": "success",
            "gcs_uri": gcs_uri,
            "signed_url": signed_url,
            "media_type": media_type.value,
            "file_name": os.path.basename(file_path),
            "survivor_id": survivor_id
        }
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return {"status": "error", "error": str(e)}


async def extract_from_media(gcs_uri: str, media_type: str, signed_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract entities and relationships from uploaded media.
    
    Args:
        gcs_uri: GCS URI of the uploaded file
        media_type: Type of media (text/image/video)
        signed_url: Optional signed URL for public/temporary access
        
    Returns:
        Dict with extraction results
    """
    try:
        if not gcs_uri:
             return {"status": "error", "error": "No GCS URI provided"}

        # Select appropriate extractor
        if media_type == MediaType.TEXT.value or media_type == "text":
            result = await text_extractor.extract(gcs_uri)
        elif media_type == MediaType.IMAGE.value or media_type == "image":
            result = await image_extractor.extract(gcs_uri)
        elif media_type == MediaType.VIDEO.value or media_type == "video":
            result = await video_extractor.extract(gcs_uri)
        else:
            return {"status": "error", "error": f"Unsupported media type: {media_type}"}
            
        # Inject signed URL into broadcast info if present
        if signed_url:
            if not result.broadcast_info:
                result.broadcast_info = {}
            result.broadcast_info['thumbnail_url'] = signed_url
        
        return {
            "status": "success",
            "extraction_result": result.to_dict(), # Return valid JSON dict instead of object
            "summary": result.summary,
            "entities_count": len(result.entities),
            "relationships_count": len(result.relationships),
            "entities": [e.to_dict() for e in result.entities],
            "relationships": [r.to_dict() for r in result.relationships]
        }
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        return {"status": "error", "error": str(e)}


def save_to_spanner(extraction_result: Any, survivor_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Save extracted entities and relationships to Spanner Graph DB.
    
    Args:
        extraction_result: ExtractionResult object (or dict from previous step if passed as dict)
        survivor_id: Optional survivor ID to associate with the broadcast
        
    Returns:
        Dict with save statistics
    """
    try:
        # Handle if extraction_result is passed as the wrapper dict from extract_from_media
        result_obj = extraction_result
        if isinstance(extraction_result, dict) and 'extraction_result' in extraction_result:
             result_obj = extraction_result['extraction_result']
        
        # If result_obj is a dict (from to_dict()), reconstruct it
        if isinstance(result_obj, dict):
            from extractors.base_extractor import ExtractionResult
            result_obj = ExtractionResult.from_dict(result_obj)
        
        if not result_obj:
            return {"status": "error", "error": "No extraction result provided"}
            
        stats = spanner_service.save_extraction_result(result_obj, survivor_id)
        
        return {
            "status": "success",
            "entities_created": stats['entities_created'],
            "entities_existing": stats['entities_found_existing'],
            "relationships_created": stats['relationships_created'],
            "broadcast_id": stats['broadcast_id'],
            "errors": stats['errors'] if stats['errors'] else None
        }
    except Exception as e:
        logger.error(f"Spanner save failed: {e}")
        return {"status": "error", "error": str(e)}


async def process_media_upload(file_path: str, survivor_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Complete pipeline: Upload -> Extract -> Save to Spanner.
    Single tool that does everything.
    
    Args:
        file_path: Path to the local file
        survivor_id: Optional survivor ID
        
    Returns:
        Complete processing result
    """
    # Step 1: Upload
    upload_result = upload_media(file_path, survivor_id)
    if upload_result['status'] != 'success':
        return upload_result
    
    # Step 2: Extract
    extraction_data = await extract_from_media(
        upload_result['gcs_uri'],
        upload_result['media_type'],
        upload_result.get('signed_url')
    )
    if extraction_data['status'] != 'success':
        return {**upload_result, **extraction_data}
    
    # Step 3: Save to Spanner
    save_result = save_to_spanner(extraction_data['extraction_result'], survivor_id)
    
    return {
        "status": "success" if save_result['status'] == 'success' else 'partial',
        "upload": upload_result,
        "extraction": {
            "summary": extraction_data['summary'],
            "entities_count": extraction_data['entities_count'],
            "relationships_count": extraction_data['relationships_count']
        },
        "database": save_result
    }
