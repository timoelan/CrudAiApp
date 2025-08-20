import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# For now, let's use SQLite for easier setup
DATABASE_URL = "sqlite:///./crudai.db"

# For PostgreSQL (when Docker is ready):
# DB_HOST = os.getenv("DB_HOST")
# DB_PORT = os.getenv("DB_PORT") 
# DB_USERNAME = os.getenv("DB_USERNAME")
# DB_PASSWORD = os.getenv("DB_PASSWORD")
# DB_DATABASE = os.getenv("DB_DATABASE")
# DATABASE_URL = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Drop all tables and recreate them (this rebuilds the database)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Datenbank neu erstellt - alle Tabellen wurden neu angelegt!")