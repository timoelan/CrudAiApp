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

# Validate Auth0 configuration
required_auth_vars = ["AUTH0_DOMAIN", "AUTH0_API_AUDIENCE", "AUTH0_ISSUER"]
missing_vars = [var for var in required_auth_vars if not os.getenv(var)]

if missing_vars:
    print(f"⚠️  Warning: Missing Auth0 environment variables: {missing_vars}")
    print("   Auth0 authentication will not work until these are configured.")
    print("   Copy .env.example to .env and fill in your Auth0 values.")
else:
    print("✅ Auth0 configuration loaded successfully")

# ===============================================================================
# FASTAPI APPLICATION SETUP
# ===============================================================================
# Initialize FastAPI app with metadata
app = FastAPI(
    title="CRUD AI Chat API with Auth0",
    description="Full-stack chat application with AI integration and Auth0 authentication",
    version="2.0.0"
)

# ===============================================================================
# CORS MIDDLEWARE CONFIGURATION
# ===============================================================================
# Allow frontend to communicate with backend - both local and Docker
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173", 
    "http://0.0.0.0:5173",
    "http://localhost:3000",  # Additional common ports
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Important for Auth0 tokens
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ===============================================================================
# ROOT ENDPOINT
# ===============================================================================
# Basic health check endpoint with Auth0 status
@app.get("/")
def root():
    auth_status = "configured" if all(os.getenv(var) for var in ["AUTH0_DOMAIN", "AUTH0_API_AUDIENCE"]) else "not configured"
    return {
        'message': 'CRUD AI Chat API with Auth0',
        'version': '2.0.0',
        'auth0_status': auth_status,
        'features': ['Chat Management', 'AI Integration', 'User Authentication']
    }

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
    