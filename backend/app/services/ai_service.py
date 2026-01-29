import os
import json
import httpx
from app.models.song import Song
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPEN_ROUTER_KEY")

SYSTEM_PROMPT = """
You are a World-Class Jazz Theorist and Arranger.
Your goal is to parse the song and provide DEEP musical insights for a musician who wants to improvise and reharmonize.

Analyze the raw text and return a JSON object.
Schema:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "key_signature": "General Key",
  "overall_sentiment": "Vibe/Emotion",
  "sections": [
    {
      "name": "Verse 1",
      "key": "Local Key",
      "chords": [
        {
           "raw": "Dm7",
           "root": "D",
           "quality": "min7",
           "function": "ii",
           "recommended_scale": "D Dorian. Target F natural.",
           "voice_leading": "Keep C in top voice moving to B in next chord.",
           "substitution": "Try G7sus4 for open sound"
        }
      ]
    }
  ],
  "performance_lines": [
    "    [Dm7]          [G7]",
    "Why do birds suddenly appear"
  ]
}

CRITICAL INSTRUCTIONS:
1. **Model**: You are analyzing for a Jazz/Fusion context.
2. **Substitutions**: ALWAYS suggest 1 reharmonization idea for interesting chords.
3. **Voice Leading**: Give specific advice.
4. **Performance Lines**: THIS IS CRITICAL. Return the song lyrics/tabs EXACTLY as provided but enclose ALL chords in square brackets []. Preserve indentation.
5. **Validation**: Ensure JSON is valid.
"""

async def analyze_song_text(raw_text: str) -> Song:
    if not OPENROUTER_API_KEY:
        raise Exception("API Key missing")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://music-learning-agent.com", 
            },
            json={
                "model": "deepseek/deepseek-chat", 
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Analyze this song deeply:\n\n{raw_text}"}
                ],
                "response_format": {"type": "json_object"}
            },
            timeout=120.0 
        )
        
        if response.status_code != 200:
             raise Exception(f"AI Provider Error: {response.text}")
             
        data = response.json()
        content = data['choices'][0]['message']['content']
        
        # Parse JSON and validate with Pydantic
        song_data = json.loads(content)
        print(f"DEBUG AI RESPONSE: {content}") # Simple debug log
        
        if isinstance(song_data, list):
            song_data = song_data[0]
            
        return Song(**song_data)
