# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.schema import CreateSchema
import os

# Neon PostgreSQL Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

# Create engine with connection pooling for Neon
# Note: Neon pooler doesn't support search_path in connect_args
# We'll set it per-session instead
engine = create_engine(
    DATABASE_URL, 
    echo=False, 
    future=True, 
    pool_pre_ping=True
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Helper to set search_path for each session
def get_db_session():
    """Get database session with search_path set to neurocare schema"""
    from sqlalchemy import text
    db = SessionLocal()
    try:
        # Set search_path for this session
        db.execute(text("SET search_path TO neurocare, public"))
        yield db
    finally:
        db.close()
