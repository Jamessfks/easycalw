from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from typing import Dict

router = APIRouter()

UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("", response_model=Dict[str, str])
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file type (basic)
        if not file.content_type.startswith(('image/', 'video/')):
             raise HTTPException(status_code=400, detail="Only image and video files are allowed.")

        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "id": unique_filename,
            "path": os.path.abspath(file_path),
            "mime_type": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
