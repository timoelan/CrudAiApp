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
    auth0_user_id: str
    username: str
    email: str
    name: str = None
    picture: str = None

class UserUpdate(BaseModel):
    username: str = None
    name: str = None
    picture: str = None

class UserResponse(BaseModel):
    id: int
    auth0_user_id: str
    username: str
    email: str
    name: str = None
    picture: str = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ===============================================================================
# CHAT SCHEMAS
# ===============================================================================
# Data models for chat creation and API responses

class ChatCreate(BaseModel):
    title: str

class ChatUpdate(BaseModel):
    title: str

class ChatResponse(BaseModel):
    id: int
    title: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

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