# Quick Start Guide - Fix CORS and 500 Errors

## Understanding Your Errors

### 1. CORS Error
**What it means**: Your frontend (http://127.0.0.1:5500) can't talk to your backend (http://localhost:8000) because browsers block requests between different "origins".

**Why it happens**: `localhost` and `127.0.0.1` are technically different origins to the browser, even though they point to the same place.

**Fixed**: The API client now auto-detects your hostname and uses the matching backend URL.

### 2. 500 Internal Server Error
**What it means**: The backend crashed when processing your request.

**Common causes**:
- Missing `.env` file
- MySQL not running
- Database doesn't exist
- Missing Python packages

## Step-by-Step Fix

### Step 1: Run Startup Check
```bash
python startup_check.py
```

This will tell you exactly what's missing.

### Step 2: Create .env File (If Missing)
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` and add:
```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_actual_password
MYSQL_DATABASE=hybrid_job_system

JWT_SECRET_KEY=your-secret-key-make-it-at-least-32-characters-long-and-random
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=your-gemini-api-key-from-google

CHROMA_PERSIST_DIRECTORY=./chroma_db

API_HOST=127.0.0.1
API_PORT=8000
DEBUG=True
```

### Step 3: Install Dependencies (If Not Done)
```bash
pip install -r requirements.txt
```

### Step 4: Start MySQL
```bash
# Windows (in PowerShell as Administrator)
net start mysql80

# Linux
sudo systemctl start mysql

# Mac
brew services start mysql
```

### Step 5: Create Database
```bash
mysql -u root -p
```

Enter your password, then:
```sql
CREATE DATABASE IF NOT EXISTS hybrid_job_system;
SHOW DATABASES;  -- Verify it's created
EXIT;
```

### Step 6: Test Backend Imports
```bash
python test_backend.py
```

You should see all ✓ checks pass.

### Step 7: Start Backend
```bash
python run.py
```

**Expected output**:
```
Starting Hybrid Job Application System...
Backend API will be available at: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/api/docs
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process
MySQL connection pool created successfully
ChromaDB initialized successfully
Database tables created successfully
INFO:     Application startup complete.
```

### Step 8: Test Backend is Working
Open a new terminal:
```bash
curl http://127.0.0.1:8000/health
```

Should return: `{"status":"healthy"}`

Or open in browser: http://127.0.0.1:8000/api/docs

### Step 9: Start Frontend
**Option A - VS Code Live Server:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"
4. **Make sure it opens at http://127.0.0.1:5500** (not localhost:5500)

**Option B - Python HTTP Server:**
```bash
# In a new terminal
python -m http.server 5500
```

Then open: http://127.0.0.1:5500

### Step 10: Test Login
1. Click "Register" on the homepage
2. Enter email and password
3. Select role (Job Seeker or Recruiter)
4. Click Register
5. Then login with the same credentials

## If It Still Doesn't Work

### Check 1: Is Backend Running?
Open http://127.0.0.1:8000/health in your browser.
- If it loads → Backend is working ✓
- If it doesn't → Backend is not running or crashed

### Check 2: Check Backend Console
Look at the terminal where you ran `python run.py`. Any red error messages?

Common errors and fixes:
```
❌ "Access denied for user 'root'@'localhost'"
   → Fix: Check MYSQL_PASSWORD in .env

❌ "Unknown database 'hybrid_job_system'"
   → Fix: Run CREATE DATABASE hybrid_job_system;

❌ "ModuleNotFoundError: No module named 'fastapi'"
   → Fix: pip install -r requirements.txt

❌ "Invalid API key"
   → Fix: Get Gemini API key from https://makersuite.google.com/app/apikey
```

### Check 3: Check Browser Console
Press F12 in your browser, go to Console tab. Any errors?

### Check 4: Use Same Hostname
Make sure BOTH use 127.0.0.1 or BOTH use localhost:
- Frontend: http://127.0.0.1:5500 ✓
- Backend: http://127.0.0.1:8000 ✓

NOT:
- Frontend: http://localhost:5500 ✗
- Backend: http://127.0.0.1:8000 ✗

## Testing Registration Flow

1. Open browser console (F12)
2. Go to Network tab
3. Try to register
4. Look at the request to `/api/auth/register`
5. Click on it to see:
   - Status code (should be 200, not 500)
   - Response (should show user info)
   - Headers (should include CORS headers)

## Complete Working Setup Checklist

- [ ] .env file exists with all credentials
- [ ] MySQL is running (test: `mysql -u root -p`)
- [ ] Database 'hybrid_job_system' exists
- [ ] Python packages installed (`python test_backend.py` passes)
- [ ] Backend starts without errors (`python run.py`)
- [ ] Health check works (http://127.0.0.1:8000/health)
- [ ] Frontend opens at http://127.0.0.1:5500
- [ ] Browser console shows no CORS errors
- [ ] Can register a new user
- [ ] Can login successfully

## Still Stuck?

Run these diagnostic commands and share the output:

```bash
# 1. Check Python version
python --version

# 2. Check if MySQL is running
# Windows:
sc query mysql80
# Linux/Mac:
systemctl status mysql

# 3. Test database connection
mysql -u root -p -e "SHOW DATABASES;"

# 4. Check if .env exists
# Windows:
dir .env
# Linux/Mac:
ls -la .env

# 5. Test imports
python test_backend.py

# 6. Start backend and check for errors
python run.py
```

See **TROUBLESHOOTING.md** for more detailed help.

