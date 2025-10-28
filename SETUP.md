# Quick Setup Guide

## Step-by-Step Installation

### 1. Prerequisites Installation

**Windows:**
```bash
# Install Python 3.13 from python.org
# Install MySQL 8.0 from mysql.com
# Install Git from git-scm.com
```

**macOS:**
```bash
brew install python@3.13 mysql@8.0
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install python3.13 python3-pip mysql-server
```

### 2. Database Setup

```bash
# Start MySQL service
# Windows: net start mysql80
# Linux/macOS: sudo systemctl start mysql

mysql -u root -p
```

```sql
CREATE DATABASE hybrid_job_system;
CREATE USER 'hybrid_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hybrid_job_system.* TO 'hybrid_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - MySQL username and password
# - Gemini API key (get from https://makersuite.google.com/app/apikey)

# Run the server
python run.py
```

### 4. Frontend Setup

**Option 1: VS Code Live Server (Recommended)**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Option 2: Python HTTP Server**
```bash
python -m http.server 5500
```

**Option 3: Node.js http-server**
```bash
npx http-server -p 5500
```

### 5. Verify Installation

1. Backend should be running at `http://localhost:8000`
2. API docs at `http://localhost:8000/api/docs`
3. Frontend at `http://localhost:5500`
4. Test registration and login

## Troubleshooting

**Port already in use:**
```bash
# Change port in .env or run script
uvicorn backend.main:app --port 8001
```

**MySQL connection error:**
- Check if MySQL is running
- Verify credentials in .env
- Ensure database exists

**ChromaDB permission error:**
```bash
# Give write permissions
chmod 755 chroma_db/
```

**CORS errors:**
- Check browser console
- Verify backend CORS settings in backend/main.py
- Ensure frontend URL is in allowed origins

