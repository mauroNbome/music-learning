from sqlalchemy import Column, String, Integer, Text
from .database import Base
import json
import uuid

class Song(Base):
    __tablename__ = "songs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True)
    artist = Column(String, index=True)
    key_signature = Column(String)
    overall_sentiment = Column(String, nullable=True)
    
    # Store complex structure as a serialized JSON string for flexibility
    # In Postgres, we could use JSONB. For SQLite/MVP, Text + Pydantic parsing is easiest.
    content_json = Column(Text) 

    def to_dict(self):
        """Convert SQL model to dictionary match Pydantic schema."""
        base_data = {
            "id": self.id,
            "title": self.title,
            "artist": self.artist,
            "key_signature": self.key_signature,
            "overall_sentiment": self.overall_sentiment,
        }
        # Merge the stored JSON content (sections, etc)
        if self.content_json:
            try:
                details = json.loads(self.content_json)
                # Ensure we don't overwrite crucial DB fields like ID
                if "id" in details:
                    del details["id"]
                base_data.update(details)
            except:
                pass
        return base_data
