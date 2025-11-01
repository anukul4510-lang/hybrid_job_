"""
Quick backend test to check if imports and configuration work.
Run this before starting the server: python test_backend.py
"""

import sys
import os
import warnings

# Suppress warnings from gRPC/ALTS before importing Google AI
warnings.filterwarnings('ignore', category=UserWarning)
os.environ['GRPC_VERBOSITY'] = 'ERROR'

print("Testing backend imports...")

try:
    print("1. Testing FastAPI import...")
    from fastapi import FastAPI
    print("   [OK] FastAPI OK")
except Exception as e:
    print(f"   [FAIL] FastAPI Error: {e}")
    sys.exit(1)

try:
    print("2. Testing Pydantic import...")
    from pydantic import BaseModel
    print("   [OK] Pydantic OK")
except Exception as e:
    print(f"   [FAIL] Pydantic Error: {e}")
    sys.exit(1)

try:
    print("3. Testing MySQL connector...")
    import mysql.connector
    print("   [OK] MySQL connector OK")
except Exception as e:
    print(f"   [FAIL] MySQL connector Error: {e}")
    sys.exit(1)

try:
    print("4. Testing ChromaDB...")
    import chromadb
    print("   [OK] ChromaDB OK")
except Exception as e:
    print(f"   [FAIL] ChromaDB Error: {e}")
    sys.exit(1)

try:
    print("5. Testing JWT libraries...")
    from jose import jwt
    from passlib.context import CryptContext
    print("   [OK] JWT libraries OK")
except Exception as e:
    print(f"   [FAIL] JWT libraries Error: {e}")
    sys.exit(1)

try:
    print("6. Testing Gemini AI...")
    import google.generativeai as genai
    print("   [OK] Gemini AI OK")
except Exception as e:
    print(f"   [FAIL] Gemini AI Error: {e}")
    sys.exit(1)

try:
    print("7. Testing configuration...")
    import config
    # Don't fail if .env is missing, just warn
    if not hasattr(config.settings, 'jwt_secret_key'):
        print("   [WARN] Warning: .env file may not be configured properly")
    else:
        print("   [OK] Configuration OK")
except Exception as e:
    print(f"   [FAIL] Configuration Error: {e}")
    print("   Make sure you have created a .env file")

try:
    print("8. Testing backend imports...")
    from backend.main import app
    print("   [OK] Backend main OK")
except Exception as e:
    print(f"   [FAIL] Backend main Error: {e}")
    print(f"   Details: {str(e)}")
    sys.exit(1)

print("\n[SUCCESS] All imports successful! Backend should start without issues.")
print("\nNext steps:")
print("1. Make sure MySQL is running")
print("2. Create .env file with your credentials (copy from .env.example)")
print("3. Run: python run.py")

