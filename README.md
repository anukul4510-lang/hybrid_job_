# Hybrid Job Application System

A full-stack job application platform with AI-powered hybrid search combining traditional SQL filtering with semantic vector search using ChromaDB and Google's Gemini AI.

## Features

### Core Functionality
- **User Management**: Registration, authentication with JWT, role-based access (Job Seeker, Recruiter, Admin)
- **Profile Management**: User profiles with skills, location, and bio
- **Job Postings**: Create, edit, delete, and manage job postings
- **Applications**: Apply to jobs, track application status, manage candidates
- **Hybrid Search**: Combines SQL filtering with AI-powered semantic search
- **AI Recommendations**: Personalized job recommendations based on user skills

### Technical Highlights
- **Backend**: FastAPI with async endpoints, Python 3.13
- **Database**: MySQL 8.0 for structured data, ChromaDB for vector embeddings
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI Integration**: Google Gemini API for embedding generation
- **Frontend**: Vanilla JavaScript ES6 modules, responsive design
- **Architecture**: Clean architecture with separation of concerns

## Project Structure

```
.
├── backend/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point
│   ├── config.py                 # Configuration and settings
│   ├── api/                      # API route handlers
│   │   ├── auth_router.py        # Authentication routes
│   │   ├── jobseeker_router.py   # Job seeker routes
│   │   ├── recruiter_router.py   # Recruiter routes
│   │   ├── admin_router.py       # Admin routes
│   │   └── search_router.py      # Search and recommendations
│   ├── models/                   # Pydantic schemas
│   │   ├── auth_models.py        # Auth-related models
│   │   ├── user_models.py        # User profile models
│   │   ├── job_models.py         # Job and application models
│   │   └── search_models.py      # Search models
│   ├── services/                 # Business logic layer
│   │   ├── auth_service.py       # Authentication logic
│   │   ├── user_service.py       # User profile logic
│   │   ├── job_service.py        # Job posting logic
│   │   └── search_service.py     # Hybrid search logic
│   ├── database/                 # Database connections
│   │   ├── mysql_connection.py   # MySQL connection pool
│   │   └── chroma_connection.py   # ChromaDB integration
│   └── utils/
│       └── dependencies.py       # FastAPI dependencies
├── scripts/                      # Frontend JavaScript modules
│   ├── api-client.js             # API client with JWT handling
│   ├── auth.js                   # Authentication handlers
│   ├── utils.js                  # Utility functions
│   ├── dashboard-jobseeker.js    # Job seeker dashboard logic
│   ├── dashboard-recruiter.js   # Recruiter dashboard logic
│   └── dashboard-admin.js        # Admin dashboard logic
├── index.html                    # Landing page
├── jobseeker-dashboard.html      # Job seeker dashboard
├── recruiter-dashboard.html      # Recruiter dashboard
├── admin-dashboard.html          # Admin dashboard
├── styles.css                    # Global styles
├── requirements.txt              # Python dependencies
├── config.py                     # Configuration
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites
- Python 3.13
- MySQL 8.0
- Node.js (for running frontend or use Live Server in VS Code)
- Google Gemini API key

### 1. Backend Setup

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=hybrid_job_system

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# ChromaDB
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

#### Setup MySQL Database
1. Create a MySQL database:
```sql
CREATE DATABASE hybrid_job_system;
```

2. The application will automatically create tables on first run

#### Run the Backend
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/api/docs`

### 2. Frontend Setup

#### Option 1: Using Live Server (VS Code)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

#### Option 2: Using Python HTTP Server
```bash
python -m http.server 5500
```

The frontend will be available at `http://localhost:5500`

## Usage

### Getting Started

1. **Register an Account**
   - Go to the home page
   - Click "Register"
   - Choose your role (Job Seeker or Recruiter)
   - Enter your email and password

2. **Job Seekers**
   - Complete your profile with skills and location
   - Browse jobs using search or AI recommendations
   - Apply to jobs that match your skills
   - Save jobs for later
   - Track your application status

3. **Recruiters**
   - Create job postings with requirements
   - Review applications from candidates
   - Shortlist or reject applications
   - Manage your job postings

4. **Admins**
   - View system statistics
   - Manage user roles
   - Monitor job postings and applications

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

#### Job Seeker
- `GET /api/jobseeker/jobs` - Browse jobs
- `POST /api/jobseeker/applications` - Apply to a job
- `GET /api/jobseeker/applications` - Get my applications
- `GET /api/jobseeker/recommendations` - Get AI recommendations

#### Recruiter
- `POST /api/recruiter/jobs` - Create job posting
- `GET /api/recruiter/jobs` - Get my job postings
- `GET /api/recruiter/jobs/{id}/applications` - Get applications for a job

#### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics

#### Search
- `POST /api/search/hybrid` - Perform hybrid search

## Hybrid Search Architecture

The system combines two search methods:

1. **SQL Filtering**: Structured queries for location, salary, employment type
2. **Vector Search**: Semantic understanding using ChromaDB embeddings

When a user searches "remote Python developer jobs in San Francisco":

1. Query is converted to embedding using Gemini API
2. ChromaDB finds semantically similar job postings
3. MySQL applies structured filters (location, salary range)
4. Results are ranked and returned to the user

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework
- **JWT**: Secure authentication
- **bcrypt**: Password hashing
- **mysql-connector-python**: MySQL connectivity
- **ChromaDB**: Vector database for embeddings
- **google-generativeai**: Gemini API integration

### Frontend
- **Vanilla JavaScript**: ES6 modules
- **Fetch API**: HTTP requests
- **LocalStorage**: Session management
- **CSS3**: Modern responsive design

## Development

### Running in Development Mode
```bash
# Backend with auto-reload
uvicorn backend.main:app --reload

# Frontend (VS Code Live Server recommended)
```

### Code Structure
- **API Layer**: Route handlers with dependency injection
- **Service Layer**: Business logic and data processing
- **Model Layer**: Pydantic schemas for validation
- **Database Layer**: Connection management and queries

### Adding New Features
1. Create Pydantic models in `backend/models/`
2. Add business logic in `backend/services/`
3. Create API routes in `backend/api/`
4. Update frontend JavaScript modules
5. Add UI components in HTML

## Troubleshooting

### Quick Diagnostics

**Step 1: Run Startup Check**
```bash
python startup_check.py
```

**Step 2: Test Backend Imports**
```bash
python test_backend.py
```

**Step 3: Check Detailed Solutions**
- **QUICK_START.md** - Step-by-step setup and common error fixes
- **ERROR_EXPLANATION.md** - Understanding CORS and 500 errors
- **TROUBLESHOOTING.md** - Comprehensive troubleshooting guide

### Common Issues

**CORS Errors**
- Use matching hostnames (both `127.0.0.1` or both `localhost`)
- Clear browser cache and hard reload (Ctrl+F5)
- See ERROR_EXPLANATION.md for details

**500 Internal Server Error**
- Check backend console for Python errors
- Verify `.env` file exists and is configured
- Ensure MySQL is running and database exists
- See QUICK_START.md for step-by-step fix

**MySQL Connection Error**
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env` file
- Create database: `CREATE DATABASE hybrid_job_system;`

**ChromaDB Errors**
- Check write permissions for `chroma_db` directory
- Delete and recreate: `rm -rf chroma_db/`

**Gemini API Errors**
- Get API key from https://makersuite.google.com/app/apikey
- Add to `.env`: `GEMINI_API_KEY=your-key`
- System falls back to SQL-only search if API fails

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please follow the existing code structure and add appropriate tests for new features.

## Support

For issues or questions, please create an issue in the project repository.

