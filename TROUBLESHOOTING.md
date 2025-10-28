# Troubleshooting Guide

## CORS Errors

### Error: "Access to fetch has been blocked by CORS policy"

**Cause**: Frontend and backend are running on different origins (localhost vs 127.0.0.1)

**Solution**:
1. Make sure both frontend and backend use the same hostname:
   - Frontend: `http://127.0.0.1:5500`
   - Backend: `http://127.0.0.1:8000`

2. Or use localhost for both:
   - Frontend: `http://localhost:5500`
   - Backend: `http://localhost:8000`

**Quick Fix**: The API client now auto-detects the hostname and uses the matching backend URL.

## 500 Internal Server Error

### Common Causes and Solutions

#### 1. Missing .env File
**Error**: Configuration errors, missing JWT secret

**Solution**:
```bash
# Create .env file
cp .env.example .env

# Edit .env and add your credentials:
# - MYSQL_USER=root
# - MYSQL_PASSWORD=your_password
# - MYSQL_DATABASE=hybrid_job_system
# - JWT_SECRET_KEY=your-secret-key-at-least-32-characters-long
# - GEMINI_API_KEY=your-gemini-api-key
```

#### 2. MySQL Not Running
**Error**: Can't connect to MySQL server

**Solution**:
```bash
# Windows
net start mysql80

# Linux/Mac
sudo systemctl start mysql
# or
brew services start mysql
```

#### 3. Database Doesn't Exist
**Error**: Unknown database 'hybrid_job_system'

**Solution**:
```sql
mysql -u root -p
CREATE DATABASE hybrid_job_system;
EXIT;
```

#### 4. Missing Python Dependencies
**Error**: ModuleNotFoundError

**Solution**:
```bash
pip install -r requirements.txt
```

## Testing the Backend

### Step 1: Test Imports
```bash
python test_backend.py
```

This will check:
- All Python packages are installed
- Configuration is loaded
- Backend modules can be imported

### Step 2: Start Backend
```bash
python run.py
```

Expected output:
```
Starting Hybrid Job Application System...
Backend API will be available at: http://127.0.0.1:8000
API Documentation: http://127.0.0.1:8000/api/docs
INFO:     Started server process
INFO:     Waiting for application startup.
MySQL connection pool created successfully
ChromaDB initialized successfully
MySQL database initialized successfully
INFO:     Application startup complete.
```

### Step 3: Test Health Endpoint
```bash
# In a new terminal
curl http://127.0.0.1:8000/health
```

Expected: `{"status":"healthy"}`

### Step 4: Check API Docs
Open in browser: http://127.0.0.1:8000/api/docs

You should see the Swagger UI with all endpoints.

## Frontend Issues

### Login Not Working

**Check**:
1. Is backend running? Check http://127.0.0.1:8000/health
2. Open browser console (F12) - any errors?
3. Check Network tab - what's the response?

**Common Issues**:
- Wrong API URL in api-client.js (should auto-detect now)
- Backend not running
- CORS not configured (fixed in main.py)

### Registration Fails

**Possible Causes**:
1. Email already exists
2. Database not initialized
3. MySQL connection error

**Solution**: Check backend console for error messages

## Database Issues

### Tables Not Created

**Solution**:
```bash
# Restart backend - tables are created on startup
python run.py
```

### Connection Pool Error

**Error**: "Can't create connection pool"

**Solutions**:
1. Check MySQL is running
2. Verify credentials in .env
3. Check if database exists
4. Try with localhost instead of 127.0.0.1 or vice versa:

```env
MYSQL_HOST=localhost
# or
MYSQL_HOST=127.0.0.1
```

## Gemini API Issues

### API Key Error

**Error**: "Invalid API key"

**Solution**:
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to .env: `GEMINI_API_KEY=your-key-here`

### Embedding Model Error

**Temporary Solution**: The system will fall back to SQL-only search if Gemini fails.

**Fix**: Check your API key and quota limits.

## Complete Reset

If nothing works, start fresh:

```bash
# 1. Stop backend (Ctrl+C)

# 2. Delete ChromaDB data
rm -rf chroma_db/
# Windows: rmdir /s chroma_db

# 3. Reset MySQL database
mysql -u root -p
DROP DATABASE IF EXISTS hybrid_job_system;
CREATE DATABASE hybrid_job_system;
EXIT;

# 4. Verify .env file exists and is correct

# 5. Test imports
python test_backend.py

# 6. Start fresh
python run.py
```

## Still Having Issues?

### Enable Debug Mode

Edit `run.py` and add log level:
```python
uvicorn.run(
    "backend.main:app",
    host="127.0.0.1",
    port=8000,
    reload=True,
    log_level="debug"  # Add this
)
```

### Check Backend Logs

Watch the terminal where you ran `python run.py` for error messages.

### Check Browser Console

Press F12 in your browser and check:
- Console tab for JavaScript errors
- Network tab for failed requests
- Click on failed request to see details

### Common Error Messages

| Error | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'fastapi'` | Run `pip install -r requirements.txt` |
| `Access denied for user 'root'@'localhost'` | Check MySQL password in .env |
| `Unknown database 'hybrid_job_system'` | Create database in MySQL |
| `CORS policy` | Use matching hostnames (both localhost or both 127.0.0.1) |
| `Failed to fetch` | Backend is not running or wrong URL |
| `500 Internal Server Error` | Check backend console for Python errors |
| `Invalid API key` | Get Gemini API key and add to .env |

## Contact/Support

If you've tried all the above and still have issues, check:
1. Backend console output
2. Browser console (F12)
3. MySQL error logs
4. Python version (should be 3.13)
5. MySQL version (should be 8.0+)

