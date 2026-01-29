from pydantic import BaseModel
from typing import List, Optional

class Chord(BaseModel):
    raw: str         # "Amin7"
    root: str        # "A"
    quality: str     # "min7"
    function: Optional[str] = None # "ii"
    recommended_scale: Optional[str] = None # "A Dorian"
    voice_leading: Optional[str] = None # "Keep common tone G"
    substitution: Optional[str] = None # "Try Tritone Sub: Eb7"

class PerformanceLine(BaseModel):
    lyrics: str # "Why do birds suddenly appear"
    chords: List[str] # ["C9", "B7(4)", "B7"] - Chords embedded in this line
    # We might want positional data later, but for now, just the list for the line.

class Section(BaseModel):
    name: str        # "Verse 1"
    key: str         # "G Major"
    chords: List[Chord]
    lyrics: Optional[str] = None
    emotion: Optional[str] = None

class Song(BaseModel):
    id: Optional[str] = None
    title: str
    artist: str
    key_signature: str
    estimated_tempo: Optional[str] = None
    sections: List[Section]
    overall_sentiment: str
    performance_lines: Optional[List[str]] = None # "Raw text lines with [Chord] embedded"
