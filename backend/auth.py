# backend/auth.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from backend.database import SessionLocal
from backend.models_db import User, Patient
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import os
import warnings

router = APIRouter(prefix="/auth", tags=["auth"])

# Secret - override with ENV in production
SECRET_KEY = os.getenv("JWT_SECRET", "supersecret_dev_key_change_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for demo

# Use bcrypt for demo (you can switch to argon2 for production).
pwd_context = CryptContext(schemes=["argon2","bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting bearer token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# bcrypt has a 72-byte input limit — we will safely truncate on the byte level
BCRYPT_MAX_BYTES = 72

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "patient"  # patient or doctor

class UserLogin(BaseModel):
    email: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _truncate_password_for_bcrypt(password: Optional[str]) -> Optional[str]:
    """
    Truncate the password at bcrypt's 72-byte limit *safely* on UTF-8 byte boundary.
    Returns the possibly truncated unicode string.
    """
    if password is None:
        return password
    b = password.encode("utf-8")
    if len(b) <= BCRYPT_MAX_BYTES:
        return password
    # Truncate bytes and decode ignoring a possibly cut multi-byte char
    truncated = b[:BCRYPT_MAX_BYTES].decode("utf-8", errors="ignore")
    warnings.warn("Password longer than 72 bytes was truncated before hashing.")
    return truncated

def get_password_hash(password: str) -> str:
    """
    Hash password for storage. Apply bcrypt truncation rule to avoid ValueError.
    """
    safe_pw = _truncate_password_for_bcrypt(password)
    return pwd_context.hash(safe_pw)

def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify password. Apply same truncation rule to the provided plain password
    so verification matches hashing behavior.
    """
    safe_plain = _truncate_password_for_bcrypt(plain)
    return pwd_context.verify(safe_plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=dict)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user. We do not auto-create a Patient with patient_code=None (to avoid NOT NULL DB errors).
    If you want to link a user to a specific patient_code, call /admin/assign_patient or adjust payload.
    """
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Informational: detect if password will be truncated (optional)
        truncated_pw = _truncate_password_for_bcrypt(payload.password)
        if truncated_pw != payload.password:
            # For demo we allow truncation but warn in logs. In production you may want to reject.
            warnings.warn("Submitted password exceeded bcrypt 72-byte limit and will be truncated before hashing.")

        user = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            full_name=payload.full_name,
            role=(payload.role or "patient")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return {"msg": "user_created", "user_id": user.id}
    except HTTPException:
        # propagate HTTPException as-is
        raise
    except Exception as e:
        try:
            db.rollback()
        except Exception:
            pass
        # don't leak sensitive internals in production; this is acceptable for dev/debugging
        raise HTTPException(status_code=500, detail=f"Signup failed: {repr(e)}")

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Login using JSON credentials (email + password).
    Returns a JWT access token (bearer).
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Decode the Bearer token and return the ORM User object.
    Raises HTTP 401 on failure.
    """
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
