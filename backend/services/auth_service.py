"""
Authentication service with JWT and password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import config
from backend.database.mysql_connection import MySQLConnection
from backend.models.auth_models import UserCreate, UserLogin, TokenData
import mysql.connector


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=config.settings.jwt_access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        config.settings.jwt_secret_key, 
        algorithm=config.settings.jwt_algorithm
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(
            token, 
            config.settings.jwt_secret_key, 
            algorithms=[config.settings.jwt_algorithm]
        )
        user_id: int = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")
        if user_id is None:
            return None
        token_data = TokenData(user_id=int(user_id), email=email, role=role)
        return token_data
    except JWTError:
        return None


def register_user(user_data: UserCreate) -> dict:
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        
    Returns:
        dict: New user information
    """
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (user_data.email,)
        )
        existing_user = cursor.fetchone()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Insert user
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, role)
            VALUES (%s, %s, %s)
            """,
            (user_data.email, password_hash, user_data.role)
        )
        
        user_id = cursor.lastrowid
        conn.commit()
        
        return {
            "id": user_id,
            "email": user_data.email,
            "role": user_data.role
        }
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()


def authenticate_user(user_data: UserLogin) -> Optional[dict]:
    """
    Authenticate a user and return user information.
    
    Args:
        user_data: Login credentials
        
    Returns:
        dict: User information if authenticated, None otherwise
    """
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    try:
        # Fetch user
        cursor.execute(
            """
            SELECT id, email, password_hash, role
            FROM users
            WHERE email = %s
            """,
            (user_data.email,)
        )
        user = cursor.fetchone()
        
        if not user:
            return None
        
        # Verify password
        if not verify_password(user_data.password, user["password_hash"]):
            return None
        
        return {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"]
        }
    finally:
        cursor.close()
        conn.close()


def get_user_by_id(user_id: int) -> Optional[dict]:
    """
    Get user by ID.
    
    Args:
        user_id: User ID
        
    Returns:
        dict: User information
    """
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            SELECT id, email, role, created_at
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )
        user = cursor.fetchone()
        return user
    finally:
        cursor.close()
        conn.close()

