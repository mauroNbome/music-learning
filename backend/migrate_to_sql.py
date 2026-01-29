import json
import os
import sys
from sqlalchemy.orm import Session
from app.db import database, models

def migrate():
    json_path = "data/songs.json"
    if not os.path.exists(json_path):
        print("No songs.json found. Skipping migration.")
        return

    print(f"Migrating data from {json_path}...")
    
    with open(json_path, "r") as f:
        try:
            songs_data = json.load(f)
        except json.JSONDecodeError:
            print("Invalid JSON.")
            return

    db = database.SessionLocal()
    
    # Create tables if not exist (normally handled by main app, but good for standalone script)
    models.Base.metadata.create_all(bind=database.engine)
    
    count = 0
    for s in songs_data:
        # Check if exists
        exists = db.query(models.Song).filter(models.Song.id == s.get("id")).first()
        if exists:
            print(f"Skipping {s.get('title')} (already exists)")
            continue
            
        print(f"Migrating: {s.get('title')}")
        db_song = models.Song(
            id=s.get("id"),
            title=s.get("title"),
            artist=s.get("artist"),
            key_signature=s.get("key_signature"),
            overall_sentiment=s.get("overall_sentiment"),
            content_json=json.dumps(s)
        )
        db.add(db_song)
        count += 1
    
    db.commit()
    db.close()
    print(f"Migration complete. Imported {count} songs.")

if __name__ == "__main__":
    # Add project root to path
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    migrate()
