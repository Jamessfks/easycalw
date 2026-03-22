import os
import uuid
import logging
import tempfile
import mimetypes
from typing import Tuple, Optional
from google.cloud import storage
from config import ExtractionConfig, MediaType

logger = logging.getLogger(__name__)

class GCSService:
    """Handle all GCS operations"""
    
    def __init__(self):
        print("DEBUG: Initializing GCSService from local file")
        # Initialize client with optional credentials if configured via env
        self.client = storage.Client(project=os.getenv('PROJECT_ID'))
        self.config = ExtractionConfig()

    @property
    def bucket(self):
        return self.client.bucket(os.getenv('GCS_BUCKET_NAME'))
    
    def detect_media_type(self, file_path: str) -> MediaType:
        """Detect media type from file extension"""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext in self.config.TEXT_EXTENSIONS:
            return MediaType.TEXT
        elif ext in self.config.IMAGE_EXTENSIONS:
            return MediaType.IMAGE
        elif ext in self.config.VIDEO_EXTENSIONS:
            return MediaType.VIDEO
        elif ext in self.config.AUDIO_EXTENSIONS:
            return MediaType.AUDIO
        else:
            # Fallback to MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type:
                if 'text' in mime_type:
                    return MediaType.TEXT
                elif 'image' in mime_type:
                    return MediaType.IMAGE
                elif 'video' in mime_type:
                    return MediaType.VIDEO
                elif 'audio' in mime_type:
                    return MediaType.AUDIO
            return MediaType.TEXT  # Default fallback
    
    def upload_file(self, file_path: str, survivor_id: Optional[str] = None) -> Tuple[str, MediaType, str]:
        """Upload file to GCS, organized by media type"""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        media_type = self.detect_media_type(file_path)
        
        # Create organized path: media/{type}/{survivor_id or 'unknown'}/{uuid}_{filename}
        survivor_folder = survivor_id or "unknown"
        blob_name = f"media/{media_type.value}/{survivor_folder}/{uuid.uuid4()}_{os.path.basename(file_path)}"
        
        blob = self.bucket.blob(blob_name)
        blob.upload_from_filename(file_path)
        
        gcs_uri = f"gs://{os.getenv('GCS_BUCKET_NAME')}/{blob_name}"
        logger.info(f"Uploaded {media_type.value} to {gcs_uri}")
        
        # Generate signed URL for immediate access
        signed_url = self.generate_signed_url(blob_name)
        
        return gcs_uri, media_type, signed_url

    def generate_signed_url(self, blob_name: str, expiration=3600) -> str:
        """Generate a signed URL for temporary read access"""
        try:
            blob = self.bucket.blob(blob_name)
            return blob.generate_signed_url(
                version="v4",
                expiration=expiration,
                method="GET"
            )
        except Exception as e:
            logger.warning(f"Could not generate signed URL (likely due to missing private key): {e}")
            # Fallback to public URL or GCS URI
            return f"https://storage.googleapis.com/{os.getenv('GCS_BUCKET_NAME')}/{blob_name}"
    
    def download_to_temp(self, gcs_uri: str) -> str:
        """Download file from GCS to temp location"""
        blob_name = gcs_uri.replace(f"gs://{os.getenv('GCS_BUCKET_NAME')}/", "")
        blob = self.bucket.blob(blob_name)
        
        # Get extension from blob name
        ext = os.path.splitext(blob_name)[1] or '.tmp'
        
        temp_file = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
        blob.download_to_filename(temp_file.name)
        temp_file.close()
        
        return temp_file.name
    
    def read_text_content(self, gcs_uri: str) -> str:
        """Read text content directly from GCS"""
        blob_name = gcs_uri.replace(f"gs://{os.getenv('GCS_BUCKET_NAME')}/", "")
        blob = self.bucket.blob(blob_name)
        return blob.download_as_text()
