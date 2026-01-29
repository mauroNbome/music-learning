from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import songbook
from app.db import models, database

# Create Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Visual Jazz Academy API",
    description="Backend for the AI Songbook and Music Logic",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*", # Allow all for production (Vercel)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(songbook.router, prefix="/api/songbook", tags=["songbook"])

@app.get("/")
async def root():
    return {"message": "Visual Jazz Academy API is running."}
