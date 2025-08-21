# ===============================================================================
# CRUD AI CHAT APP - MAIN APPLICATION ENTRY POINT
# ===============================================================================
# FastAPI application with CORS configuration and route setup
# Handles database initialization and serves the API endpoints

from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routes import router

# ===============================================================================
# ENVIRONMENT CONFIGURATION
# ===============================================================================
# Load environment variables from .env file
load_dotenv()

# ===============================================================================
# FASTAPI APPLICATION SETUP
# ===============================================================================
# Initialize FastAPI app with metadata
app = FastAPI(
    title="CRUD AI Chat API",
    description="Full-stack chat application with AI integration",
    version="1.0.0"
)

# ===============================================================================
# CORS MIDDLEWARE CONFIGURATION
# ===============================================================================
# Allow frontend (localhost:5173) to communicate with backend
origins = [
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"]
)

# ===============================================================================
# ROOT ENDPOINT
# ===============================================================================
# Basic health check endpoint
@app.get("/")
def root():
    return {'message' : 'Hello World'}

# ===============================================================================
# ROUTE REGISTRATION
# ===============================================================================
# Include all API routes (CRUD + AI endpoints)
app.include_router(router)

# ===============================================================================
# APPLICATION STARTUP
# ===============================================================================
# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    