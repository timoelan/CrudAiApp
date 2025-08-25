# ===============================================================================
# CRUD AI CHAT APP - DATABASE MODELS
# ===============================================================================
# SQLAlchemy ORM models for Users, Chats, and Messages
# Defines database schema and relationships between entities

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# ===============================================================================
# DATABASE BASE CLASS
# ===============================================================================
# Base class for all ORM models
Base = declarative_base()

# ===============================================================================
# USER MODEL
# ===============================================================================
# Represents users who can create and participate in chats
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    auth0_user_id = Column(String, unique=True, nullable=False)  # Auth0 user ID (sub claim)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    name = Column(String, nullable=True)  # Full name from Auth0
    picture = Column(String, nullable=True)  # Profile picture URL from Auth0
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

# ===============================================================================
# MESSAGE MODEL
# ===============================================================================
# Represents individual messages in chats (both user and AI messages)
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    content = Column(String, nullable=False)
    is_from_user = Column(Boolean, nullable=False)  # True = User, False = AI
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

# ===============================================================================
# CHAT MODEL
# ===============================================================================
# Represents chat conversations that contain multiple messages
class Chat(Base):
    __tablename__ = "chats"  
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
