"""
Authentication service with JWT and password hashing.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
import config
from backend.database.mysql_connection import MySQLConnection
from backend.models.auth_models import UserCreate, UserLogin, TokenData
import mysql.connector
import re


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Country code to phone number validation rules
COUNTRY_PHONE_RULES: Dict[str, Dict] = {
    "+1": {"length": 10, "name": "US/Canada", "pattern": r"^\d{10}$"},
    "+91": {"length": 10, "name": "India", "pattern": r"^\d{10}$"},
    "+44": {"length": 10, "name": "UK", "pattern": r"^\d{10}$"},
    "+61": {"length": 9, "name": "Australia", "pattern": r"^\d{9}$"},
    "+81": {"length": 10, "name": "Japan", "pattern": r"^\d{10}$"},
    "+86": {"length": 11, "name": "China", "pattern": r"^\d{11}$"},
    "+49": {"length": 11, "name": "Germany", "pattern": r"^\d{11}$"},
    "+33": {"length": 9, "name": "France", "pattern": r"^\d{9}$"},
    "+39": {"length": 10, "name": "Italy", "pattern": r"^\d{10}$"},
    "+34": {"length": 9, "name": "Spain", "pattern": r"^\d{9}$"},
    "+7": {"length": 10, "name": "Russia", "pattern": r"^\d{10}$"},
    "+82": {"length": 10, "name": "South Korea", "pattern": r"^\d{10}$"},
    "+52": {"length": 10, "name": "Mexico", "pattern": r"^\d{10}$"},
    "+55": {"length": 11, "name": "Brazil", "pattern": r"^\d{11}$"},
    "+27": {"length": 9, "name": "South Africa", "pattern": r"^\d{9}$"},
    "+31": {"length": 9, "name": "Netherlands", "pattern": r"^\d{9}$"},
    "+46": {"length": 9, "name": "Sweden", "pattern": r"^\d{9}$"},
    "+47": {"length": 8, "name": "Norway", "pattern": r"^\d{8}$"},
    "+971": {"length": 9, "name": "UAE", "pattern": r"^\d{9}$"},
    "+65": {"length": 8, "name": "Singapore", "pattern": r"^\d{8}$"},
    "+60": {"length": 9, "name": "Malaysia", "pattern": r"^\d{9}$"},
    "+62": {"length": 9, "name": "Indonesia", "pattern": r"^\d{9,11}$"},
    "+63": {"length": 10, "name": "Philippines", "pattern": r"^\d{10}$"},
    "+66": {"length": 9, "name": "Thailand", "pattern": r"^\d{9}$"},
    "+84": {"length": 9, "name": "Vietnam", "pattern": r"^\d{9,10}$"},
}


def validate_phone_number(phone: str) -> tuple:
    """
    Validate phone number format based on country code.
    
    Args:
        phone: Full phone number with country code (e.g., "+919876543210")
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not phone:
        return True, ""  # Phone is optional
    
    # Extract country code and number
    phone_clean = phone.replace(" ", "").replace("-", "")
    
    # Try to match country code
    matched_country = None
    matched_code = None
    
    for country_code, rules in COUNTRY_PHONE_RULES.items():
        if phone_clean.startswith(country_code):
            matched_country = rules
            matched_code = country_code
            break
    
    if not matched_country:
        # Unknown country code - validate as generic (7-15 digits after +)
        number_part = re.sub(r"^\+\d{1,4}", "", phone_clean)
        if len(number_part) < 7 or len(number_part) > 15:
            return False, "Phone number must be between 7 and 15 digits"
        if not re.match(r"^\d+$", number_part):
            return False, "Phone number must contain only digits"
        return True, ""
    
    # Extract number part (without country code)
    number_part = phone_clean[len(matched_code):]
    
    # Remove any non-digit characters
    number_part = re.sub(r"\D", "", number_part)
    
    # Validate against pattern
    if not re.match(matched_country["pattern"], number_part):
        return False, f"Phone number for {matched_country['name']} must be exactly {matched_country['length']} digits (excluding country code)"
    
    return True, ""


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
    cursor = conn.cursor(dictionary=True)  # Use dictionary cursor
    
    try:
        # Validate phone number if provided
        if user_data.phone:
            is_valid, error_msg = validate_phone_number(user_data.phone)
            if not is_valid:
                raise ValueError(error_msg)
        
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
            INSERT INTO users (email, password_hash, role, company_name)
            VALUES (%s, %s, %s, %s)
            """,
            (user_data.email, password_hash, user_data.role, user_data.company_name)
        )
        
        user_id = cursor.lastrowid
        
        # Create profile automatically with registration data
        cursor.execute(
            """
            INSERT INTO user_profiles (user_id, first_name, last_name, phone, location)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, user_data.first_name, user_data.last_name, 
             user_data.phone, user_data.location)
        )
        
        conn.commit()
        
        # Fetch the complete user record to get created_at
        cursor.execute(
            """
            SELECT id, email, role, company_name, created_at
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )
        user = cursor.fetchone()
        
        return user
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
    cursor = conn.cursor(dictionary=True)  # Use dictionary cursor
    
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
    cursor = conn.cursor(dictionary=True)  # Use dictionary cursor
    
    try:
        # Get user info with profile
        cursor.execute(
            """
            SELECT u.id, u.email, u.role, u.company_name, u.created_at,
                   up.first_name, up.last_name
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = %s
            """,
            (user_id,)
        )
        user = cursor.fetchone()
        return user
    finally:
        cursor.close()
        conn.close()

