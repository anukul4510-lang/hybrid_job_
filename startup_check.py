"""
Startup checklist for Hybrid Job Application System.
Checks all prerequisites before starting the server.
"""

import os
import sys

def check_file(filepath, description):
    """Check if a file exists."""
    if os.path.exists(filepath):
        print(f"   [OK] {description}")
        return True
    else:
        print(f"   [FAIL] {description} - NOT FOUND")
        return False

def check_env_variable(var_name):
    """Check if environment variable is set in .env file."""
    try:
        with open('.env', 'r') as f:
            content = f.read()
            if f"{var_name}=" in content and not content.split(f"{var_name}=")[1].split('\n')[0].strip() == "":
                return True
    except:
        pass
    return False

def main():
    print("=" * 60)
    print("HYBRID JOB APPLICATION SYSTEM - STARTUP CHECK")
    print("=" * 60)
    
    all_good = True
    
    # Check .env file
    print("\n1. Checking .env file...")
    if not check_file('.env', '.env file exists'):
        print("   → ACTION: Copy .env.example to .env and fill in your credentials")
        print("   → Run: copy .env.example .env")
        all_good = False
    else:
        # Check required env variables
        required_vars = ['MYSQL_PASSWORD', 'JWT_SECRET_KEY', 'GEMINI_API_KEY']
        print("\n2. Checking .env variables...")
        for var in required_vars:
            if check_env_variable(var):
                print(f"   [OK] {var} is set")
            else:
                print(f"   [FAIL] {var} is missing or empty")
                print(f"   → ACTION: Add {var} to your .env file")
                all_good = False
    
    # Check Python dependencies
    print("\n3. Checking Python packages...")
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('mysql.connector', 'MySQL Connector'),
        ('chromadb', 'ChromaDB'),
        ('jose', 'Python-JOSE'),
        ('passlib', 'Passlib'),
        ('pydantic', 'Pydantic'),
    ]
    
    for package, name in required_packages:
        try:
            __import__(package)
            print(f"   [OK] {name}")
        except ImportError:
            print(f"   [FAIL] {name} - NOT INSTALLED")
            print(f"   → ACTION: pip install -r requirements.txt")
            all_good = False
            break
    
    # Check MySQL connection (optional, needs credentials)
    print("\n4. MySQL Connection...")
    print("   → You need to verify MySQL manually:")
    print("   → Windows: net start mysql80")
    print("   → Linux/Mac: sudo systemctl start mysql")
    print("   → Create database: mysql -u root -p")
    print("                      CREATE DATABASE hybrid_job_system;")
    
    # Summary
    print("\n" + "=" * 60)
    if all_good:
        print("[SUCCESS] All checks passed! You can start the server.")
        print("\nNext steps:")
        print("1. Make sure MySQL is running")
        print("2. Run: python run.py")
        print("3. Open browser: http://127.0.0.1:5500 (frontend)")
        print("4. API docs at: http://127.0.0.1:8000/api/docs")
    else:
        print("[FAIL] Some checks failed. Please fix the issues above.")
        print("\nQuick fixes:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Create .env file: copy .env.example .env")
        print("3. Edit .env and add your credentials")
        print("4. Start MySQL service")
        print("5. Create database: CREATE DATABASE hybrid_job_system;")
    print("=" * 60)
    
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(main())

