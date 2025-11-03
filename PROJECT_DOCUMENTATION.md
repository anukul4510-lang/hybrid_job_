# Hybrid Job Application System - Complete Project Documentation

> **For Team Members**: This document explains everything about our project so you can understand and contribute effectively.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [What This Project Does](#what-this-project-does)
3. [Technologies Used](#technologies-used)
4. [Key Features](#key-features)
5. [How The System Works](#how-the-system-works)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [Getting Started](#getting-started)
9. [Important Concepts](#important-concepts)
10. [Team Collaboration Guide](#team-collaboration-guide)

---

## 🎯 Project Overview

### What We Built

We built a **full-stack web application** called "Hybrid Job Application System" - think of it like LinkedIn or Indeed, but with AI-powered search features.

### The Problem We Solved

- **Job seekers** struggle to find jobs that match their skills
- **Recruiters** have difficulty finding the right candidates
- Traditional keyword search is limited
- No intelligent matching between jobs and candidates

### Our Solution

A platform where:
- Job seekers can search jobs using **natural language** (e.g., "Python developer in San Francisco")
- Recruiters can search candidates using **AI-powered matching**
- The system **intelligently matches** people to jobs based on skills, experience, and preferences
- Everything is powered by **AI and machine learning**

---

## 🎬 What This Project Does

### For Job Seekers (Users looking for jobs):

1. **Register/Login**: Create an account with email and password
2. **Create Profile**: Add name, location, skills, bio, resume
3. **Browse Jobs**: See all available job postings
4. **Search Jobs**: Use natural language like "Python developer remote"
5. **Apply to Jobs**: Submit applications with cover letters
6. **Track Applications**: See status (pending, reviewed, accepted, rejected)
7. **Save Jobs**: Bookmark jobs to apply later
8. **Get Recommendations**: AI suggests jobs based on your profile

### For Recruiters (Companies hiring):

1. **Register/Login**: Create company account
2. **Post Jobs**: Create job postings with descriptions, requirements, salary
3. **Search Candidates**: Use AI to find candidates (e.g., "experienced Java developer")
4. **Review Applications**: See who applied to jobs
5. **Shortlist Candidates**: Save promising candidates
6. **Track Pipeline**: Manage candidates through hiring stages

### For Admins (System managers):

1. **View All Users**: See all job seekers and recruiters
2. **Manage System**: Configure settings, view statistics
3. **Monitor Activity**: Track what's happening in the system

---

## 💻 Technologies Used

### Backend (Server-Side)

| Technology | Why We Used It | What It Does |
|------------|---------------|--------------|
| **Python 3.13** | Modern, easy to read, powerful | Programming language for backend |
| **FastAPI** | Fast, modern web framework | Creates REST API endpoints |
| **MySQL 8.0** | Relational database | Stores all data (users, jobs, applications) |
| **ChromaDB** | Vector database | Stores AI embeddings for semantic search |
| **JWT (JSON Web Tokens)** | Secure authentication | Manages user login sessions |
| **bcrypt** | Password security | Hashes passwords safely |
| **Google Gemini AI** | Natural language processing | Converts text to embeddings for AI search |

### Frontend (Client-Side)

| Technology | Why We Used It | What It Does |
|------------|---------------|--------------|
| **HTML5** | Structure of web pages | Creates the layout and forms |
| **CSS3** | Styling | Makes pages look beautiful |
| **JavaScript (ES6+)** | Interactivity | Handles user actions, API calls |
| **Fetch API** | HTTP requests | Communicates with backend |
| **LocalStorage** | Browser storage | Saves login tokens |

### Architecture Pattern

- **RESTful API**: Standard way to communicate between frontend and backend
- **MVC-like Pattern**: Separates concerns (Models, Views, Controllers)
- **Connection Pooling**: Efficient database connections
- **JWT Authentication**: Secure, stateless authentication

---

## ✨ Key Features

### 1. User Authentication & Authorization

**What it does:**
- Users can register with email and password
- Passwords are hashed (encrypted) before storing
- Login generates JWT token for session management
- Different roles: Job Seeker, Recruiter, Admin

**How it works:**
```
User registers → Password hashed with bcrypt → User stored in database
User logs in → Password verified → JWT token generated → Token stored in browser
Every API request → Token sent in header → Backend verifies token → Access granted/denied
```

### 2. Profile Management

**What it does:**
- Users create detailed profiles (name, location, skills, bio)
- Multiple skills can be added with proficiency levels
- Resume upload and management
- Profile updates anytime

**Database:**
- `users` table: Basic info (email, password, role)
- `user_profiles` table: Extended info (name, location, bio)
- `user_skills` table: Links users to skills (many-to-many)

### 3. Job Posting System

**What it does:**
- Recruiters create job postings
- Jobs have title, description, company, location, salary range
- Skills required for each job
- Status management: active, closed, draft

**Database:**
- `job_postings` table: Job details
- `job_skills` table: Links jobs to required skills

### 4. Application System

**What it does:**
- Job seekers apply to jobs
- Applications include cover letter
- Status tracking: pending → reviewed → shortlisted/rejected/accepted
- Both job seekers and recruiters can view applications

**Database:**
- `applications` table: Application records with status

### 5. AI-Powered Hybrid Search

**What it does:**
- **Traditional SQL Search**: Filters by location, skills, job type
- **AI Vector Search**: Understands meaning and context
- **Combined Results**: Best of both approaches

**How it works:**
```
1. User enters query: "Python developer remote"
2. Query converted to embedding (vector) using Gemini AI
3. Vector compared with job embeddings in ChromaDB
4. SQL also filters by keywords
5. Results ranked and combined
6. Most relevant jobs shown first
```

### 6. Candidate Search (Recruiters)

**What it does:**
- Recruiters search candidates using natural language
- AI matches candidates based on skills, experience, location
- Shows match score (0-100%)
- One-click shortlisting

**Example:**
- Query: "Senior Python developer with 5 years in San Francisco"
- System finds candidates matching these criteria
- Shows percentage match for each candidate

### 7. Shortlist Management

**What it does:**
- Recruiters save candidates to shortlist
- Track candidates through pipeline: Shortlisted → Contacted → Interviewing → Hired
- Add notes for each candidate
- Link candidates to specific jobs

---

## 🔄 How The System Works

### System Architecture (High Level)

```
┌─────────────────┐
│   Frontend      │  (HTML, JavaScript, CSS)
│   (Browser)     │
└────────┬────────┘
         │ HTTP Requests (REST API)
         │ JWT Token Authentication
         ▼
┌─────────────────┐
│   Backend       │  (FastAPI, Python)
│   API Server    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ MySQL  │ │ ChromaDB │
│        │ │          │
│ Users  │ │ Vectors  │
│ Jobs   │ │          │
│ Apps   │ │          │
└────────┘ └──────────┘
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│  Gemini AI      │
│  (Embeddings)   │
└─────────────────┘
```

### Data Flow Example: User Applies to Job

```
1. User clicks "Apply" button
   ↓
2. Frontend JavaScript sends POST request to /api/jobseeker/applications
   ↓
3. Backend receives request, verifies JWT token
   ↓
4. Backend service creates application record in MySQL
   ↓
5. Backend creates notification for recruiter
   ↓
6. Response sent back to frontend
   ↓
7. Frontend updates UI to show "Applied" status
```

### Authentication Flow

```
1. User enters email/password and clicks Login
   ↓
2. Frontend sends credentials to /api/auth/login
   ↓
3. Backend checks email in database
   ↓
4. Backend verifies password using bcrypt
   ↓
5. If correct, backend creates JWT token
   ↓
6. Token sent back to frontend
   ↓
7. Frontend saves token in LocalStorage
   ↓
8. Future requests include token in Authorization header
   ↓
9. Backend verifies token on each request
```

---

## 📁 Project Structure

```
cruz/
│
├── backend/                      # All server-side code
│   ├── main.py                   # Application entry point (starts server)
│   ├── config.py                 # Configuration settings
│   │
│   ├── api/                      # API endpoints (routes)
│   │   ├── auth_router.py        # Login, register endpoints
│   │   ├── jobseeker_router.py   # Job seeker endpoints
│   │   ├── recruiter_router.py   # Recruiter endpoints
│   │   ├── admin_router.py       # Admin endpoints
│   │   └── search_router.py      # Search endpoints
│   │
│   ├── models/                   # Data models (schemas)
│   │   ├── auth_models.py         # User, login models
│   │   ├── user_models.py         # Profile models
│   │   ├── job_models.py          # Job, application models
│   │   └── search_models.py      # Search query models
│   │
│   ├── services/                 # Business logic
│   │   ├── auth_service.py        # Authentication logic
│   │   ├── user_service.py        # User profile logic
│   │   ├── job_service.py         # Job posting logic
│   │   ├── search_service.py      # Hybrid search logic
│   │   ├── recruiter_service.py   # Candidate search logic
│   │   └── resume_service.py     # Resume management
│   │
│   ├── database/                 # Database connections
│   │   ├── mysql_connection.py    # MySQL connection pool
│   │   └── chroma_connection.py   # ChromaDB connection
│   │
│   └── utils/                    # Utilities
│       └── dependencies.py       # Authentication dependencies
│
├── scripts/                      # Frontend JavaScript files
│   ├── api-client.js              # HTTP request handler
│   ├── auth.js                    # Login/register functions
│   ├── dashboard-jobseeker.js     # Job seeker page logic
│   ├── dashboard-recruiter.js     # Recruiter page logic
│   ├── dashboard-admin.js         # Admin page logic
│   └── utils.js                  # Helper functions
│
├── *.html                        # Frontend pages
│   ├── index.html                # Login/Register page
│   ├── jobseeker-dashboard.html  # Job seeker dashboard
│   ├── recruiter-dashboard.html  # Recruiter dashboard
│   └── admin-dashboard.html     # Admin dashboard
│
├── styles.css                     # Global CSS styles
├── requirements.txt              # Python dependencies
├── config.py                     # Configuration file
├── run.py                        # Server startup script
│
└── Documentation files:
    ├── README.md                 # Main documentation
    ├── SETUP.md                  # Setup instructions
    ├── ARCHITECTURE.md            # Architecture details
    └── PROJECT_DOCUMENTATION.md   # This file
```

### File Responsibilities

**Backend:**
- `main.py`: Creates FastAPI app, includes routers, starts server
- `api/*.py`: Define endpoints (URLs that handle requests)
- `services/*.py`: Business logic (what happens when endpoint is called)
- `models/*.py`: Data validation schemas
- `database/*.py`: Database connection management

**Frontend:**
- `*.html`: Page structure and layout
- `scripts/*.js`: JavaScript logic for each page
- `styles.css`: Visual styling

---

## 🗄️ Database Schema

### Core Tables

#### 1. `users`
Stores basic user information and authentication.
- `id`: Unique user ID (primary key)
- `email`: User email (unique, for login)
- `password_hash`: Encrypted password
- `role`: Job seeker, Recruiter, or Admin
- `company_name`: Company name (for recruiters)

#### 2. `user_profiles`
Extended profile information.
- `user_id`: Links to users table
- `first_name`, `last_name`: User's name
- `location`, `address`: Location information
- `job_of_choice`: Preferred job role
- `bio`: Professional biography
- `years_experience`: Work experience
- `resume_url`: Link to resume file

#### 3. `skills`
Catalog of all skills in the system.
- `id`: Skill ID
- `name`: Skill name (e.g., "Python", "React")

#### 4. `user_skills`
Links users to their skills (many-to-many).
- `user_id`: Which user
- `skill_id`: Which skill
- `proficiency_level`: Beginner, Intermediate, Advanced, Expert

#### 5. `job_postings`
Job postings created by recruiters.
- `id`: Job ID
- `recruiter_id`: Who posted it
- `title`: Job title
- `company`: Company name
- `description`: Job description
- `location`: Job location
- `min_salary`, `max_salary`: Salary range
- `status`: Active, Closed, Draft

#### 6. `job_skills`
Links jobs to required skills (many-to-many).
- `job_id`: Which job
- `skill_id`: Which skill required

#### 7. `applications`
Job applications submitted by job seekers.
- `id`: Application ID
- `jobseeker_id`: Who applied
- `job_id`: Which job
- `cover_letter`: Cover letter text
- `status`: Pending, Reviewed, Shortlisted, Rejected, Accepted

#### 8. `shortlisted_candidates`
Candidates shortlisted by recruiters.
- `id`: Shortlist ID
- `recruiter_id`: Who shortlisted
- `candidate_id`: Who was shortlisted
- `job_id`: Associated job (optional)
- `match_score`: AI match score (0-100)
- `status`: Shortlisted, Contacted, Interviewing, Rejected, Hired

### Relationships

- **One-to-One**: `users` ↔ `user_profiles` (each user has one profile)
- **One-to-Many**: 
  - `users` → `job_postings` (recruiter posts many jobs)
  - `users` → `applications` (job seeker makes many applications)
  - `job_postings` → `applications` (job receives many applications)
- **Many-to-Many**: 
  - `users` ↔ `skills` (via `user_skills`)
  - `job_postings` ↔ `skills` (via `job_skills`)

---

## 🚀 Getting Started

### Prerequisites

Before you start, you need:

1. **Python 3.13** (or 3.11+)
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version`

2. **MySQL 8.0**
   - Download from: https://dev.mysql.com/downloads/
   - Create a database called `job_application_db`

3. **Google Gemini API Key**
   - Get from: https://aistudio.google.com/app/apikey
   - Free tier available

4. **Code Editor** (VS Code recommended)

### Installation Steps

#### Step 1: Clone/Download Project
```bash
cd cruz
```

#### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- MySQL connector (database)
- ChromaDB (vector database)
- JWT library (authentication)
- And more...

#### Step 3: Configure Settings
Edit `config.py`:
```python
mysql_host = "localhost"
mysql_user = "your_username"
mysql_password = "your_password"
mysql_database = "job_application_db"
gemini_api_key = "your_gemini_api_key"
```

#### Step 4: Create Database
```bash
python run.py
```

This will:
- Create MySQL tables automatically
- Seed initial skills
- Set up ChromaDB

#### Step 5: Start Server
```bash
python run.py
```

Server runs on: `http://localhost:8000`

#### Step 6: Open Frontend
1. Open `index.html` in browser (or use Live Server in VS Code)
2. Or open directly: `file:///path/to/cruz/index.html`

### Testing

1. **Register a user**: Click "Register" → Fill form → Submit
2. **Login**: Use registered email/password
3. **Explore**: Navigate through different features

---

## 📚 Important Concepts

### 1. REST API

**What it is:** Standard way to communicate between frontend and backend.

**How it works:**
- **GET**: Retrieve data (e.g., get all jobs)
- **POST**: Create data (e.g., create application)
- **PUT**: Update data (e.g., update profile)
- **DELETE**: Remove data (e.g., delete job)

**Example:**
```
GET /api/jobseeker/jobs     → Returns list of jobs
POST /api/jobseeker/applications  → Creates new application
PUT /api/jobseeker/profile  → Updates user profile
```

### 2. JWT Authentication

**What it is:** JSON Web Token - secure way to manage user sessions.

**How it works:**
1. User logs in with email/password
2. Backend creates JWT token (contains user ID, email, role)
3. Token sent to frontend
4. Frontend stores token
5. Every API request includes token
6. Backend verifies token before processing

**Why it's secure:**
- Tokens are signed (can't be tampered with)
- Tokens expire after some time
- No need to store sessions in database

### 3. Connection Pooling

**What it is:** Reusing database connections instead of creating new ones each time.

**Why it matters:**
- Faster (no connection overhead)
- More efficient (limited connections)
- Better performance

### 4. Vector Embeddings

**What it is:** Converting text to numbers that represent meaning.

**Example:**
- "Python developer" → [0.23, -0.45, 0.12, ...] (vector of numbers)
- Similar phrases have similar vectors
- Allows semantic search (understanding meaning)

**How we use it:**
- Convert job descriptions to vectors
- Store in ChromaDB
- When searching, convert query to vector
- Find similar vectors (similar jobs)

### 5. Hybrid Search

**What it is:** Combining traditional search with AI search.

**Traditional (SQL):**
- Exact keyword matching
- Fast and precise
- Limited to keywords

**AI (Vector):**
- Understands meaning
- Finds similar content
- Can handle synonyms

**Hybrid:**
- SQL filters by exact criteria (location, skills)
- AI ranks by relevance and meaning
- Best of both worlds

---

## 👥 Team Collaboration Guide

### Understanding Your Role

**If you're working on Frontend:**
- Focus on: `*.html`, `scripts/*.js`, `styles.css`
- Learn: JavaScript, DOM manipulation, API calls
- Tasks: UI improvements, user experience, forms

**If you're working on Backend:**
- Focus on: `backend/api/*.py`, `backend/services/*.py`
- Learn: Python, FastAPI, SQL queries
- Tasks: New endpoints, business logic, database queries

**If you're working on Database:**
- Focus on: `backend/database/*.py`, SQL schemas
- Learn: MySQL, query optimization
- Tasks: Database design, queries, indexing

**If you're working on AI/Search:**
- Focus on: `backend/services/search_service.py`, `backend/services/recruiter_service.py`
- Learn: Vector embeddings, semantic search
- Tasks: Search improvements, AI integration

### Common Tasks

#### Adding a New Feature

1. **Plan**: What needs to be added?
2. **Database**: Do you need a new table? Modify existing?
3. **Backend**: Create API endpoint in `api/`, add logic in `services/`
4. **Frontend**: Add UI in HTML, add JavaScript logic
5. **Test**: Test the feature end-to-end

#### Debugging

1. **Check browser console** (F12) for JavaScript errors
2. **Check server logs** in terminal for backend errors
3. **Check database** using MySQL client
4. **Use print statements** or logging

#### Making Changes

1. **Test locally first**
2. **Commit frequently** with clear messages
3. **Update documentation** if needed
4. **Communicate** with team about changes

### Code Style Guidelines

**Python:**
- Use meaningful variable names
- Add comments for complex logic
- Follow PEP 8 style guide
- Keep functions focused (single responsibility)

**JavaScript:**
- Use `const` and `let` (not `var`)
- Use async/await for API calls
- Add error handling
- Comment complex logic

**Database:**
- Use parameterized queries (prevent SQL injection)
- Add indexes for frequently queried columns
- Use transactions for multiple operations

### Communication Tips

- **Ask questions**: If you don't understand something, ask!
- **Share progress**: Let team know what you're working on
- **Document changes**: Update docs when adding features
- **Code reviews**: Review each other's code

---

## 🔍 Quick Reference

### Important URLs

- **Backend API**: `http://localhost:8000/api`
- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Frontend**: Open `index.html` in browser

### Important Files

- **Backend Entry**: `backend/main.py`
- **Database Config**: `config.py`
- **Frontend API Client**: `scripts/api-client.js`
- **Database Schema**: `DATABASE_SCHEMA_EXPLANATION.md`

### Common Commands

```bash
# Start server
python run.py

# Install dependencies
pip install -r requirements.txt

# Test API
python test_api.py

# Seed test data
python seed_jobseekers.py
python seed_recruiters_companies.py
```

### Database Queries (Examples)

```sql
-- Get all active jobs
SELECT * FROM job_postings WHERE status = 'active';

-- Get user's applications
SELECT * FROM applications WHERE jobseeker_id = 1;

-- Get user's skills
SELECT s.name FROM skills s
JOIN user_skills us ON s.id = us.skill_id
WHERE us.user_id = 1;
```

---

## 📞 Getting Help

### If You're Stuck

1. **Check Documentation**: README.md, SETUP.md, this file
2. **Check Code Comments**: Code is well-commented
3. **Ask Team Members**: We're here to help!
4. **Search Error Messages**: Google the error message

### Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **MySQL Docs**: https://dev.mysql.com/doc/
- **JavaScript MDN**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **ChromaDB Docs**: https://docs.trychroma.com/

---

## 🎓 Summary

### What We Built
A complete job application platform with AI-powered search.

### Technologies
- **Backend**: Python, FastAPI, MySQL, ChromaDB
- **Frontend**: HTML, CSS, JavaScript
- **AI**: Google Gemini for embeddings
- **Auth**: JWT tokens

### Key Features
- User authentication
- Profile management
- Job postings
- Applications
- AI search
- Candidate matching

### How It Works
1. Users register/login
2. Job seekers browse/search jobs
3. Recruiters post jobs and search candidates
4. Applications connect them
5. AI helps with matching

### Your Role
- Understand the codebase
- Contribute to features
- Fix bugs
- Improve the system
- Work together as a team

---

**Remember**: This is a learning project. Don't be afraid to experiment, make mistakes, and learn from them. We're all in this together! 🚀

---

*Last Updated: [Current Date]*
*Version: 1.0*

