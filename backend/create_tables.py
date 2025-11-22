# backend/create_tables.py
from backend.database import engine
from backend.models_db import Base

def create_all():
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully in your database.")

if __name__ == "__main__":
    create_all()
