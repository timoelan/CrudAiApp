# ===============================================================================
# CRUD AI CHAT APP - API ROUTES
# ===============================================================================
# FastAPI router with all endpoints for Users, Chats, Messages, and AI
# Handles CRUD operations and AI response generation

from fastapi import APIRouter, HTTPException
from database import SessionLocal
from models import Chat, User, Message
from schemas import ChatCreate, ChatResponse, UserCreate, UserResponse, MessageCreate, MessageResponse
from ai_service import ollama_service
from typing import List

# ===============================================================================
# ROUTER INITIALIZATION
# ===============================================================================
# Main API router for all endpoints
router = APIRouter()

# ===============================================================================
# USER ENDPOINTS
# ===============================================================================
# CRUD operations for user management

@router.get("/users/{user_id}")
def get_user(user_id: int):
    """Get a specific user by ID"""
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    return user

@router.post("/users")
def create_user(user: UserCreate):
    """Create a new user"""
    db = SessionLocal()
    
    db_user = User(username=user.username, email=user.email)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    """Delete a user by ID"""
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    db.close()
    return {"ok": True}

@router.put("/users/{user_id}")
def update_user(user_id: int, user: UserCreate):
    """Update an existing user"""
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.username = user.username
        db_user.email = user.email
        db.commit()
        db.refresh(db_user)
    db.close()
    return db_user

# ===============================================================================
# CHAT ENDPOINTS
# ===============================================================================
# CRUD operations for chat management

@router.get("/chats")
def get_chats():
    """Get all chats"""
    db = SessionLocal()
    chats = db.query(Chat).all()
    db.close()
    return chats

@router.get("/chats/{chat_id}")
def get_chat(chat_id: int):
    """Get a specific chat by ID"""
    db = SessionLocal()
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    db.close()
    return chat

@router.post("/chats")
def create_chat(chat: ChatCreate):
    """Create a new chat"""
    db = SessionLocal()
    
    db_chat = Chat(title=chat.title, user_id=1)  # TODO: Use actual user ID
    
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    db.close()
    
    return db_chat

@router.put("/chats/{chat_id}")
def update_chat(chat_id: int, chat: ChatCreate):
    """Update an existing chat (rename)"""
    db = SessionLocal()
    db_chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if db_chat:
        db_chat.title = chat.title
        db.commit()
        db.refresh(db_chat)
    db.close()
    return db_chat

@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: int):
    """Delete a chat and all its messages"""
    db = SessionLocal()
    db_chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if db_chat:
        db.delete(db_chat)
        db.commit()
    db.close()
    return {"ok": True}

# ===============================================================================
# MESSAGE ENDPOINTS
# ===============================================================================
# CRUD operations for message management within chats

@router.get('/messages/{chat_id}', response_model=List[MessageResponse])
def get_messages(chat_id: int):
    """Get all messages for a specific chat, ordered by creation time"""
    db = SessionLocal()
    try:
        # Check if chat exists
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()
        return messages
    finally:
        db.close()

@router.post('/messages', response_model=MessageResponse)
def create_message(message: MessageCreate):
    """Create a new message in a chat"""
    db = SessionLocal()
    try:
        # Check if chat exists
        chat = db.query(Chat).filter(Chat.id == message.chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        db_message = Message(
            chat_id=message.chat_id,
            content=message.content,
            is_from_user=message.is_from_user
        )
        
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        return db_message
    finally:
        db.close()

# ===============================================================================
# AI ENDPOINTS
# ===============================================================================
# AI response generation using Ollama local models

@router.post('/ai/generate/{chat_id}', response_model=MessageResponse)
async def generate_ai_response(chat_id: int):
    """Generate AI response for the latest message in a chat"""
    db = SessionLocal()
    try:
        # Check if chat exists
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Load recent messages for conversation context
        recent_messages = db.query(Message).filter(
            Message.chat_id == chat_id
        ).order_by(Message.created_at.desc()).limit(10).all()
        
        if not recent_messages:
            raise HTTPException(status_code=400, detail="No messages to respond to")
        
        # Check if Ollama AI service is available
        if not await ollama_service.is_available():
            raise HTTPException(status_code=503, detail="AI service unavailable. Make sure Ollama is running.")
        
        # Build conversation context from recent messages
        context = []
        for msg in reversed(recent_messages):  # Oldest first for proper context
            role = "user" if msg.is_from_user else "assistant"
            context.append(f"{role}: {msg.content}")
        
        conversation_context = "\n".join(context)
        
        # Find the latest user message to respond to
        last_user_message = next((msg for msg in recent_messages if msg.is_from_user), None)
        if not last_user_message:
            raise HTTPException(status_code=400, detail="No user message found")
        
        # Generate AI response using conversation context
        system_prompt = f"""Du bist ein hilfreicher AI-Assistent. 
Antworte auf Deutsch und sei freundlich und hilfreich. 
Hier ist der bisherige Gesprächsverlauf:
{conversation_context}

Antworte nun auf die letzte Nachricht des Nutzers."""
        
        ai_response = await ollama_service.generate_response(
            prompt=last_user_message.content,
            system_prompt=system_prompt
        )
        
        if not ai_response:
            raise HTTPException(status_code=500, detail="Failed to generate AI response")
        
        # Save AI response to database
        ai_message = Message(
            chat_id=chat_id,
            content=ai_response,
            is_from_user=False  # This is an AI message
        )
        
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return ai_message
        
    finally:
        db.close()
