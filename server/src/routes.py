# ===============================================================================
# CRUD AI CHAT APP - API ROUTES WITH AUTH0 INTEGRATION
# ===============================================================================
# FastAPI router with all endpoints for Users, Chats, Messages, and AI
# Now includes Auth0 authentication and user management

from fastapi import APIRouter, HTTPException, Depends
from database import SessionLocal
from models import Chat, User, Message
from schemas import ChatCreate, ChatResponse, UserCreate, UserResponse, MessageCreate, MessageResponse, UserUpdate, ChatUpdate
from ai_service import ollama_service
from auth_service import get_current_user, get_current_user_optional
from typing import List, Optional

# ===============================================================================
# ROUTER INITIALIZATION
# ===============================================================================
# Main API router for all endpoints
router = APIRouter()

# ===============================================================================
# USER ENDPOINTS WITH AUTH0
# ===============================================================================
# User management with Auth0 authentication

@router.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get the current authenticated user's profile"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            # Auto-create user if they don't exist but are authenticated
            user_data = UserCreate(
                auth0_user_id=auth0_user_id,
                username=current_user.get("nickname", current_user.get("email", "user")),
                email=current_user.get("email", ""),
                name=current_user.get("name"),
                picture=current_user.get("picture")
            )
            user = await create_user_internal(user_data, db)
        
        return user
    finally:
        db.close()

@router.put("/users/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update the current authenticated user's profile"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update only provided fields
        if user_update.username is not None:
            user.username = user_update.username
        if user_update.name is not None:
            user.name = user_update.name
        if user_update.picture is not None:
            user.picture = user_update.picture
            
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()

async def create_user_internal(user_data: UserCreate, db) -> User:
    """Internal helper to create user"""
    db_user = User(
        auth0_user_id=user_data.auth0_user_id,
        username=user_data.username,
        email=user_data.email,
        name=user_data.name,
        picture=user_data.picture
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ===============================================================================
# CHAT ENDPOINTS WITH AUTH0
# ===============================================================================
# Chat management with user authentication

@router.get("/chats", response_model=List[ChatResponse])
async def get_user_chats(current_user: dict = Depends(get_current_user)):
    """Get all chats for the authenticated user"""
    db = SessionLocal()
    try:
        # Get user from database
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        chats = db.query(Chat).filter(Chat.user_id == user.id).order_by(Chat.updated_at.desc()).all()
        return chats
    finally:
        db.close()

@router.get("/chats/{chat_id}", response_model=ChatResponse)
async def get_chat(chat_id: int, current_user: dict = Depends(get_current_user)):
    """Get a specific chat (only if owned by user)"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        return chat
    finally:
        db.close()

@router.post("/chats", response_model=ChatResponse)
async def create_chat(chat: ChatCreate, current_user: dict = Depends(get_current_user)):
    """Create a new chat for the authenticated user"""
    db = SessionLocal()
    try:
        # Get user from database
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            # Auto-create user if they don't exist
            user_data = UserCreate(
                auth0_user_id=auth0_user_id,
                username=current_user.get("nickname", current_user.get("email", "user")),
                email=current_user.get("email", ""),
                name=current_user.get("name"),
                picture=current_user.get("picture")
            )
            user = await create_user_internal(user_data, db)
        
        db_chat = Chat(title=chat.title, user_id=user.id)
        
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        return db_chat
    finally:
        db.close()

@router.put("/chats/{chat_id}", response_model=ChatResponse)
async def update_chat(chat_id: int, chat_update: ChatUpdate, current_user: dict = Depends(get_current_user)):
    """Update a chat (only if owned by user)"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db_chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
        if not db_chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        db_chat.title = chat_update.title
        db.commit()
        db.refresh(db_chat)
        return db_chat
    finally:
        db.close()

@router.delete("/chats/{chat_id}")
async def delete_chat(chat_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a chat and all its messages (only if owned by user)"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        db_chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
        if not db_chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        # Delete all messages in this chat first
        db.query(Message).filter(Message.chat_id == chat_id).delete()
        db.delete(db_chat)
        db.commit()
        return {"ok": True}
    finally:
        db.close()

# ===============================================================================
# MESSAGE ENDPOINTS WITH AUTH0
# ===============================================================================
# Message management with user authentication

@router.get('/messages/{chat_id}', response_model=List[MessageResponse])
async def get_messages(chat_id: int, current_user: dict = Depends(get_current_user)):
    """Get all messages for a specific chat (only if user owns the chat)"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user owns the chat
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
            
        messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()
        return messages
    finally:
        db.close()

@router.post('/messages', response_model=MessageResponse)
async def create_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Create a new message in a chat (only if user owns the chat)"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user owns the chat
        chat = db.query(Chat).filter(Chat.id == message.chat_id, Chat.user_id == user.id).first()
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
# AI ENDPOINTS WITH AUTH0
# ===============================================================================
# AI response generation with user authentication

@router.post('/ai/generate/{chat_id}', response_model=MessageResponse)
async def generate_ai_response(chat_id: int, current_user: dict = Depends(get_current_user)):
    """Generate AI response for the latest message in a chat (only if user owns the chat)"""
    db = SessionLocal()
    try:
        auth0_user_id = current_user.get("sub")
        user = db.query(User).filter(User.auth0_user_id == auth0_user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user owns the chat
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == user.id).first()
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
        username = user.name or user.username or "User"
        system_prompt = f"""Du bist ein hilfreicher AI-Assistent für {username}. 
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
