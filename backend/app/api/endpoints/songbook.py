from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
import json
import uuid

from app.services.ai_service import analyze_song_text
from app.models.song import Song as SongSchema # Pydantic
from app.db import models, database # SQL

router = APIRouter()

class AnalyzeRequest(BaseModel):
    raw_text: str

@router.post("/analyze", response_model=SongSchema)
async def analyze_song(request: AnalyzeRequest):
    try:
        song = await analyze_song_text(request.raw_text)
        return song
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[SongSchema])
def list_songs(db: Session = Depends(database.get_db)):
    """List all saved songs from DB."""
    songs_db = db.query(models.Song).all()
    # Convert SQL models to Pydantic schemas (using the helper to merge JSON content)
    return [SongSchema(**s.to_dict()) for s in songs_db]

@router.post("/", response_model=SongSchema)
def save_song(song: SongSchema, db: Session = Depends(database.get_db)):
    """Save a new song to the DB."""
    
    # Check if ID exists, else generate
    song_id = song.id if song.id else str(uuid.uuid4())
    
    # Prepare JSON content (exclude top-level columns to avoid duplication/confusion, 
    # but simplest is to just dump everything into content_json so we don't lose anything)
    content_dump = song.model_dump()
    content_dump["id"] = song_id # Ensure ID is in the blob
    
    db_song = models.Song(
        id=song_id,
        title=song.title,
        artist=song.artist,
        key_signature=song.key_signature,
        overall_sentiment=song.overall_sentiment,
        content_json=json.dumps(content_dump)
    )
    
    # Check if exists (Upsert logic for MVP)
    existing = db.query(models.Song).filter(models.Song.id == song_id).first()
    if existing:
        existing.title = song.title
        existing.artist = song.artist
        existing.key_signature = song.key_signature
        existing.overall_sentiment = song.overall_sentiment
        existing.content_json = json.dumps(content_dump)
    else:
        db.add(db_song)
        
    db.commit()
    return SongSchema(**db_song.to_dict())

@router.get("/{song_id}", response_model=SongSchema)
def get_song(song_id: str, db: Session = Depends(database.get_db)):
    """Get a specific song by ID."""
    db_song = db.query(models.Song).filter(models.Song.id == song_id).first()
    db_song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")
    return SongSchema(**db_song.to_dict())

@router.delete("/{song_id}")
def delete_song(song_id: str, db: Session = Depends(database.get_db)):
    """Delete a song by ID."""
    db_song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    db.delete(db_song)
    db.commit()
    return {"message": "Song deleted successfully"}
