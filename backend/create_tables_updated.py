#!/usr/bin/env python3
"""
Create/update all database tables including new ones for game assignments,
medical documents, and patient reports.
"""
from backend.database import engine
from backend.models_db import Base

def create_all_tables():
    """Create all tables defined in models_db.py"""
    print("Creating/updating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ All tables created/updated successfully!")
    print("\nTables created:")
    print("  - users")
    print("  - patients")
    print("  - game_scores")
    print("  - predictions")
    print("  - game_assignments (NEW)")
    print("  - medical_documents (NEW)")
    print("  - patient_reports (NEW)")

if __name__ == "__main__":
    create_all_tables()
