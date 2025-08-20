from fastapi import APIRouter
from database import SessionLocal
from models import Chat, User, Message
from schemas import ChatCreate, ChatResponse, UserCreate, UserResponse, MessageCreate, MessageResponse

router = APIRouter()

@router.get("/users/{user_id}")
def get_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()

    return user

@router.post("/users")
def create_user(user: UserCreate):
    db = SessionLocal()
    
    db_user = User(username=user.username, email=user.email)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int):
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    db.close()
    return {"ok": True}

@router.put("/users/{user_id}")
def update_user(user_id: int, user: UserCreate):
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.username = user.username
        db_user.email = user.email
        db.commit()
        db.refresh(db_user)
    db.close()
    return db_user

@router.get("/chats")
def get_chats():
    db = SessionLocal()
    chats = db.query(Chat).all()
    db.close()
    return chats

@router.get("/chats/{chat_id}")
def get_chat(chat_id: int):

    db = SessionLocal()
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    db.close()
    return chat

@router.post("/chats")
def create_chat(chat: ChatCreate):
    db = SessionLocal()
    
    db_chat = Chat(title=chat.title, user_id=1)  
    
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    db.close()
    
    return db_chat

@router.put("/chats/{chat_id}")
def update_chat(chat_id: int, chat: ChatCreate):
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
    db = SessionLocal()
    db_chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if db_chat:
        db.delete(db_chat)
        db.commit()
    db.close()
    return {"ok": True}

@router.get('/messages/{chat_id}')
def get_messages(chat_id: int):
    db = SessionLocal()
    messages = db.query(Message).filter(Message.chat_id == chat_id).all()
    db.close()
    return messages

@router.post('/messages')
def create_message(message: MessageCreate):
    db = SessionLocal()
    db_message = Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    db.close()
    return db_message
