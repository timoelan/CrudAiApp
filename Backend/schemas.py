# ===============================================================================
# CRUD AI CHAT APP - PYDANTIC SCHEMAS
# ===============================================================================
# Data validation and serialization models for API requests and responses
# Defines the structure of data exchanged between frontend and backend

from pydantic import BaseModel
from datetime import datetime

# ===============================================================================
# USER SCHEMAS
# ===============================================================================
# Data models for user creation and API responses

class UserCreate(BaseModel):
    username: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

# ===============================================================================
# CHAT SCHEMAS
# ===============================================================================
# Data models for chat creation and API responses

class ChatCreate(BaseModel):
    title: str

class ChatResponse(BaseModel):
    id: int
    title: str
    user_id: int

# ===============================================================================
# MESSAGE SCHEMAS
# ===============================================================================
# Data models for message creation and API responses

class MessageCreate(BaseModel):
    chat_id: int
    content: str
    is_from_user: bool
    
    class Config:
        extra = "forbid"  # Reject unknown fields

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    content: str
    is_from_user: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allow ORM model conversion