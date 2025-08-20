from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

class ChatCreate(BaseModel):
    title: str

class ChatResponse(BaseModel):
    id: int
    title: str
    user_id: int

class MessageCreate(BaseModel):
    chat_id: int
    content: str
    is_from_user: bool

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    content: str
    is_from_user: bool
    created_at: datetime