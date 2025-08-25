# ===============================================================================
# CRUD AI CHAT APP - DATABASE CONFIGURATION
# ===============================================================================
# SQLAlchemy database setup and connection management
# Handles database URL configuration and session creation

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  

# ===============================================================================
# ENVIRONMENT SETUP
# ===============================================================================
# Load environment variables from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# ===============================================================================
# DATABASE URL CONFIGURATION
# ===============================================================================
# Using SQLite for simplicity (file-based database)
DATABASE_URL = "sqlite:///./crudai.db"

# PostgreSQL configuration (for future use with Docker):
# DB_HOST = os.getenv("DB_HOST")
# DB_PORT = os.getenv("DB_PORT") 
# DB_USERNAME = os.getenv("DB_USERNAME")
# DB_PASSWORD = os.getenv("DB_PASSWORD")
# DB_DATABASE = os.getenv("DB_DATABASE")
# DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"

# ===============================================================================
# DATABASE ENGINE AND SESSION SETUP
# ===============================================================================
# Create database engine and session factory
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ===============================================================================
# DATABASE INITIALIZATION
# ===============================================================================
# Create tables only if they don't exist (preserve existing data)
Base.metadata.create_all(bind=engine)
print("Datenbank initialisiert - Tabellen erstellt falls sie nicht existieren!")