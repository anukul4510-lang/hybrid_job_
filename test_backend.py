"""
Quick backend test to check if imports and configuration work.
Run this before starting the server: python test_backend.py
"""

import sys

print("Testing backend imports...")

try:
    print("1. Testing FastAPI import...")
    from fastapi import FastAPI
    print("   ✓ FastAPI OK")
except Exception as e:
    print(f"   ✗ FastAPI Error: {e}")
    sys.exit(1)

try:
    print("2. Testing Pydantic import...")
    from pydantic import BaseModel
    print("   ✓ Pydantic OK")
except Exception as e:
    print(f"   ✗ Pydantic Error: {e}")
    sys.exit(1)

try:
    print("3. Testing MySQL connector...")
    import mysql.connector
    print("   ✓ MySQL connector OK")
except Exception as e:
    print(f"   ✗ MySQL connector Error: {e}")
    sys.exit(1)

try:
    print("4. Testing ChromaDB...")
    import chromadb
    print("   ✓ ChromaDB OK")
except Exception as e:
    print(f"   ✗ ChromaDB Error: {e}")
    sys.exit(1)

try:
    print("5. Testing JWT libraries...")
    from jose import jwt
    from passlib.context import CryptContext
    print("   ✓ JWT libraries OK")
except Exception as e:
    print(f"   ✗ JWT libraries Error: {e}")
    sys.exit(1)

try:
    print("6. Testing Gemini AI...")
    import google.generativeai as genai
    print("   ✓ Gemini AI OK")
except Exception as e:
    print(f"   ✗ Gemini AI Error: {e}")
    sys.exit(1)

try:
    print("7. Testing configuration...")
    import config
    # Don't fail if .env is missing, just warn
    if not hasattr(config.settings, 'jwt_secret_key'):
        print("   ⚠ Warning: .env file may not be configured properly")
    else:
        print("   ✓ Configuration OK")
except Exception as e:
    print(f"   ✗ Configuration Error: {e}")
    print("   Make sure you have created a .env file")

try:
    print("8. Testing backend imports...")
    from backend.main import app
    print("   ✓ Backend main OK")
except Exception as e:
    print(f"   ✗ Backend main Error: {e}")
    print(f"   Details: {str(e)}")
    sys.exit(1)

print("\n✅ All imports successful! Backend should start without issues.")
print("\nNext steps:")
print("1. Make sure MySQL is running")
print("2. Create .env file with your credentials (copy from .env.example)")
print("3. Run: python run.py")

