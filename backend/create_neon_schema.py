#!/usr/bin/env python3
"""
Create NeuroCare AI schema in Neon PostgreSQL database
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from backend.models_db import Base
import os

# Neon PostgreSQL connection
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_f67csZhUEAVx@ep-tiny-credit-ah2fufav-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

def create_schema():
    """Create neurocare schema and all tables"""
    print("Connecting to Neon PostgreSQL database...")
    engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)
    
    try:
        # Create schema
        with engine.connect() as conn:
            print("\n📦 Creating 'neurocare' schema...")
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS neurocare"))
            conn.commit()
            print("✓ Schema 'neurocare' created/verified")
        
        # Update Base metadata to use schema
        for table in Base.metadata.tables.values():
            table.schema = "neurocare"
        
        # Create all tables in the schema
        print("\n📋 Creating tables in 'neurocare' schema...")
        Base.metadata.create_all(bind=engine)
        
        print("\n✅ All tables created successfully!")
        print("\nTables created in 'neurocare' schema:")
        print("  - neurocare.users")
        print("  - neurocare.patients")
        print("  - neurocare.game_scores")
        print("  - neurocare.predictions")
        print("  - neurocare.game_assignments")
        print("  - neurocare.medical_documents")
        print("  - neurocare.patient_reports")
        
        # Verify tables
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'neurocare' ORDER BY table_name"
            ))
            tables = [row[0] for row in result]
            print(f"\n✓ Verified {len(tables)} tables in database:")
            for table in tables:
                print(f"  ✓ {table}")
        
    except Exception as e:
        print(f"\n❌ Error creating schema: {e}")
        raise
    finally:
        engine.dispose()

if __name__ == "__main__":
    create_schema()
