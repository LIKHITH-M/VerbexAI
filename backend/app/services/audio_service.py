import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from pathlib import Path

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".mp4", ".ogg", ".mpeg", ".mpga", ".aac", ".flac", ".opus"}
MAX_AUDIO_SIZE_MB = 500

async def save_audio_file(file: UploadFile, meeting_id: str) -> str:
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file format '{ext}'. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Prepare storage path
    storage_dir = Path(f"storage/audio/{meeting_id}")
    storage_dir.mkdir(parents=True, exist_ok=True)
    
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = storage_dir / file_name
    
    # Save in chunks and validate size
    size_counter = 0
    chunk_size = 1024 * 1024  # 1MB
    
    try:
        async with aiofiles.open(file_path, "wb") as out_file:
            while content := await file.read(chunk_size):
                size_counter += len(content)
                if size_counter > MAX_AUDIO_SIZE_MB * 1024 * 1024:
                    # Cleanup and raise
                    await out_file.close()
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    raise HTTPException(
                        status_code=413, 
                        detail=f"File too large. Max size: {MAX_AUDIO_SIZE_MB}MB"
                    )
                await out_file.write(content)
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to save audio: {str(e)}")
        
    return str(file_path)
