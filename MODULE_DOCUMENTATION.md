# Module Documentation - Hybrid Job Application System

This document provides a comprehensive overview of all modules in the Hybrid Job Application System, organized by category and functionality.

---

## 📊 Module Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Backend API Routers** | 5 | FastAPI route handlers for different user roles |
| **Backend Services** | 7 | Business logic and data processing modules |
| **Backend Models** | 4 | Pydantic data validation schemas |
| **Backend Database** | 2 | Database connection and management modules |
| **Backend Utils** | 1 | Utility functions for authentication and dependencies |
| **Frontend JavaScript** | 7 | Client-side modules for user interactions |
| **Frontend HTML** | 4 | User interface pages |
| **Utility Scripts** | 8 | Setup, seeding, and testing scripts |
| **Core Files** | 2 | Main application entry point and configuration |
| **Total Modules** | **40** | Complete system modules |

---

## 🔧 Backend Modules (Python)

### 1. Core Application Files (2 modules)

#### 1.1 `backend/main.py`
- **Purpose**: FastAPI application entry point
- **Responsibilities**:
  - Application initialization
  - Route registration
  - Middleware configuration
  - Database initialization
  - Lifespan management (startup/shutdown)
- **Key Features**: CORS configuration, JWT secret management, router mounting

#### 1.2 `config.py`
- **Purpose**: Application configuration management
- **Responsibilities**:
  - Environment variable loading
  - Database configuration (MySQL, ChromaDB)
  - API keys management (Gemini AI)
  - JWT secret configuration
  - Application settings
- **Key Features**: Settings class with database credentials, API keys

---

### 2. API Router Modules (5 modules)

#### 2.1 `backend/api/auth_router.py`
- **Purpose**: Authentication and authorization endpoints
- **Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/token` - User login (JWT token generation)
  - `GET /api/auth/me` - Get current user information
- **Key Features**: Password hashing, JWT token generation, user validation

#### 2.2 `backend/api/jobseeker_router.py`
- **Purpose**: Job seeker-specific API endpoints
- **Endpoints**:
  - Profile management (create, update, get)
  - Job browsing and searching
  - Job applications (create, list, track)
  - Skills management (add, remove, list)
  - Resume management (upload, create, list)
  - Saved jobs (save, list)
  - Job recommendations (AI-powered suggestions)
- **Key Features**: Role-based access control, comprehensive job seeker features

#### 2.3 `backend/api/recruiter_router.py`
- **Purpose**: Recruiter-specific API endpoints
- **Endpoints**:
  - Job posting management (create, update, delete, list)
  - Application review (list, update status)
  - Candidate search (AI-powered search)
  - Shortlist management (add, remove, update status)
- **Key Features**: Advanced candidate search, hiring pipeline management

#### 2.4 `backend/api/admin_router.py`
- **Purpose**: Administrator API endpoints
- **Endpoints**:
  - User management (list, update role, delete)
  - System statistics
  - Job posting oversight
  - Activity monitoring
- **Key Features**: System-wide administration, user role management

#### 2.5 `backend/api/search_router.py`
- **Purpose**: Hybrid search API endpoints
- **Endpoints**:
  - `POST /api/search/hybrid` - Hybrid search (SQL + Vector)
  - Job and candidate search with natural language processing
- **Key Features**: Semantic search, AI-powered matching, hybrid query processing

---

### 3. Service Modules (7 modules)

#### 3.1 `backend/services/auth_service.py`
- **Purpose**: Authentication and user management business logic
- **Functions**:
  - `register_user()` - User registration with validation
  - `authenticate_user()` - Password verification
  - `create_access_token()` - JWT token generation
  - `validate_phone_number()` - Phone number validation by country code
- **Key Features**: bcrypt password hashing, JWT creation, phone validation

#### 3.2 `backend/services/user_service.py`
- **Purpose**: User profile and skill management
- **Functions**:
  - `create_user_profile()` - Create user profile
  - `get_user_profile()` - Retrieve user profile
  - `update_user_profile()` - Update profile information
  - `create_skill()` - Add new skill to database
  - `get_all_skills()` - List all available skills
  - `add_user_skill()` - Associate skill with user
  - `remove_user_skill()` - Remove user skill association
  - `get_user_skills()` - Get user's skills
  - `get_skill_recommendations()` - AI-powered skill suggestions
- **Key Features**: Skill management, profile updates, skill recommendations

#### 3.3 `backend/services/job_service.py`
- **Purpose**: Job posting and application management
- **Functions**:
  - `create_job_posting()` - Create new job posting
  - `get_job_posting()` - Get job details
  - `update_job_posting()` - Update job information
  - `delete_job_posting()` - Delete job posting
  - `get_all_job_postings()` - List all jobs
  - `create_application()` - Submit job application
  - `get_applications()` - Get user's applications
  - `update_application_status()` - Update application status
  - `save_job()` - Bookmark job for later
  - `get_saved_jobs()` - Get user's saved jobs
- **Key Features**: Job CRUD operations, application tracking, saved jobs

#### 3.4 `backend/services/recruiter_service.py`
- **Purpose**: Recruiter-specific business logic
- **Functions**:
  - `advanced_user_search()` - AI-powered candidate search
  - `shortlist_candidate()` - Add candidate to shortlist
  - `get_shortlisted_candidates()` - Get recruiter's shortlist
  - `update_shortlist_status()` - Update candidate status in pipeline
  - `remove_from_shortlist()` - Remove candidate from shortlist
- **Key Features**: Natural language candidate search, match scoring, hiring pipeline

#### 3.5 `backend/services/search_service.py`
- **Purpose**: Hybrid search and recommendation engine
- **Functions**:
  - `generate_embedding()` - Convert text to vector embeddings (Gemini AI)
  - `index_job_posting()` - Index job in ChromaDB for semantic search
  - `hybrid_search()` - Combine SQL filtering with vector search
  - `sql_only_search()` - Fallback SQL search when AI unavailable
  - `get_recommendations()` - AI-powered job recommendations
  - `_skill_based_sql_search()` - Skill-based job matching (fallback)
- **Key Features**: Hybrid search architecture, AI fallback mechanisms, semantic matching

#### 3.6 `backend/services/admin_service.py`
- **Purpose**: Administrative functions
- **Functions**:
  - `get_all_users()` - List all system users
  - `update_user_role()` - Change user role
  - `delete_user()` - Remove user from system
  - `get_system_stats()` - Get system statistics
- **Key Features**: User management, system oversight, role administration

#### 3.7 `backend/services/resume_service.py`
- **Purpose**: Resume management functionality
- **Functions**:
  - `create_resume()` - Create new resume
  - `get_resumes()` - Get user's resumes
  - `get_resume()` - Get specific resume
  - `update_resume()` - Update resume content
  - `delete_resume()` - Delete resume
  - `set_primary_resume()` - Set primary resume
  - `upload_resume_file()` - Upload resume PDF/file
  - `add_resume_by_url()` - Add resume via URL
- **Key Features**: Multi-resume support, file uploads, resume management

---

### 4. Model Modules (4 modules)

#### 4.1 `backend/models/auth_models.py`
- **Purpose**: Authentication-related Pydantic schemas
- **Models**:
  - `UserCreate` - User registration schema
  - `Token` - JWT token response schema
  - `TokenData` - Token payload schema
- **Key Features**: Email validation, password requirements, role validation

#### 4.2 `backend/models/user_models.py`
- **Purpose**: User profile and skill schemas
- **Models**:
  - `UserProfileCreate` - Profile creation schema
  - `UserProfileUpdate` - Profile update schema
  - `UserProfileResponse` - Profile response schema
  - `SkillCreate` - Skill creation schema
  - `SkillResponse` - Skill response schema
  - `UserSkillCreate` - User-skill association schema
  - `UserSkillResponse` - User skill response schema
- **Key Features**: Comprehensive profile validation, skill management schemas

#### 4.3 `backend/models/job_models.py`
- **Purpose**: Job posting and application schemas
- **Models**:
  - `JobPostingCreate` - Job creation schema
  - `JobPostingUpdate` - Job update schema
  - `JobPostingResponse` - Job response schema
  - `ApplicationCreate` - Application creation schema
  - `ApplicationUpdate` - Application update schema
  - `ApplicationResponse` - Application response schema
- **Key Features**: Job validation, application tracking, salary validation

#### 4.4 `backend/models/search_models.py`
- **Purpose**: Search and recommendation schemas
- **Models**:
  - `SearchQuery` - Search request schema
  - `SearchResponse` - Search result schema
  - `RecommendationResponse` - Recommendation response schema
- **Key Features**: Natural language query handling, search filters

---

### 5. Database Modules (2 modules)

#### 5.1 `backend/database/mysql_connection.py`
- **Purpose**: MySQL database connection management
- **Features**:
  - Connection pooling (10 connections)
  - Table creation and initialization
  - Default skills seeding
  - Database schema management
  - Transaction handling
- **Key Functions**:
  - `create_pool()` - Initialize connection pool
  - `get_connection()` - Get connection from pool
  - `create_tables_sync()` - Create database schema
  - `seed_default_skills()` - Populate default skills

#### 5.2 `backend/database/chroma_connection.py`
- **Purpose**: ChromaDB vector database connection
- **Features**:
  - Vector embedding storage
  - Semantic search index
  - Persistent storage on disk
  - Job and resume embeddings
- **Key Functions**:
  - `initialize_chroma()` - Initialize ChromaDB
  - `get_collection()` - Get vector collection
  - `search_jobs()` - Vector similarity search
  - `index_job()` - Add job to vector index

---

### 6. Utility Modules (1 module)

#### 6.1 `backend/utils/dependencies.py`
- **Purpose**: FastAPI dependency injection utilities
- **Functions**:
  - `get_current_user()` - Extract and validate JWT token
  - `get_current_recruiter()` - Validate recruiter access
  - `get_current_admin()` - Validate admin access
- **Key Features**: JWT token validation, role-based access control

---

## 🎨 Frontend Modules

### 1. JavaScript Modules (7 modules)

#### 1.1 `scripts/api-client.js`
- **Purpose**: Centralized API communication module
- **Features**:
  - HTTP request handling
  - JWT token management
  - Error handling
  - API endpoint abstraction
- **Methods**: All API endpoints (auth, jobs, applications, skills, resumes, etc.)
- **Key Features**: Token storage in LocalStorage, automatic token inclusion in requests

#### 1.2 `scripts/auth.js`
- **Purpose**: Authentication and login/registration handling
- **Features**:
  - Login form handling
  - Registration form handling
  - Phone number validation
  - Role-based redirects
  - Token management
- **Key Functions**: `initializeLoginForm()`, `initializeRegistrationForm()`, `showLogin()`, `showRegister()`

#### 1.3 `scripts/dashboard-jobseeker.js`
- **Purpose**: Job seeker dashboard functionality
- **Features**:
  - Profile management
  - Job browsing and searching
  - Application tracking
  - Skills management
  - Resume builder
  - Job recommendations (AI-powered)
  - Saved jobs management
- **Key Functions**: `showProfile()`, `showBrowseJobs()`, `showMyApplications()`, `showJobSuggestions()`, `showSkills()`, `showResumes()`

#### 1.4 `scripts/dashboard-recruiter.js`
- **Purpose**: Recruiter dashboard functionality
- **Features**:
  - Job posting management (CRUD)
  - Application review
  - AI-powered candidate search
  - Shortlist management
  - Hiring pipeline tracking
- **Key Functions**: `showJobPostings()`, `createJob()`, `searchCandidates()`, `reviewApplications()`, `showShortlist()`

#### 1.5 `scripts/dashboard-admin.js`
- **Purpose**: Administrator dashboard functionality
- **Features**:
  - User management
  - System statistics
  - Job posting oversight
  - Role management
- **Key Functions**: `showUsers()`, `updateUserRole()`, `showStatistics()`

#### 1.6 `scripts/phone-validation.js`
- **Purpose**: Phone number validation utility
- **Features**:
  - Country code validation rules
  - Phone number format validation
  - Placeholder and help text generation
  - Real-time validation feedback
- **Key Functions**: `validatePhoneNumber()`, `updatePhoneInputForCountry()`, `getPhoneValidationRules()`
- **Supports**: 24+ country codes with specific validation rules

#### 1.7 `scripts/utils.js`
- **Purpose**: Shared utility functions
- **Features**:
  - Loader/spinner creation
  - Error message formatting
  - Date formatting
  - Common UI helpers
- **Key Functions**: `createLoader()`, `formatDate()`, `showError()`, `showSuccess()`

---

### 2. HTML Pages (4 modules)

#### 2.1 `index.html`
- **Purpose**: Landing page with authentication
- **Features**:
  - Login form
  - Registration form
  - Role selection (Job Seeker/Recruiter)
  - Phone number validation UI
  - Navigation between login/register
- **Sections**: Login section, Registration section, Home section

#### 2.2 `jobseeker-dashboard.html`
- **Purpose**: Job seeker main dashboard
- **Features**:
  - Sidebar navigation
  - Content area for dynamic content
  - Profile management UI
  - Job browsing interface
  - Application tracking
  - Skills management
  - Resume builder interface
  - Job recommendations display
- **Sections**: Profile, Resumes, Skills, Browse Jobs, My Applications, Saved Jobs, Job Suggestions

#### 2.3 `recruiter-dashboard.html`
- **Purpose**: Recruiter main dashboard
- **Features**:
  - Job posting management UI
  - Application review interface
  - Candidate search interface
  - Shortlist management
  - Hiring pipeline visualization
- **Sections**: Job Postings, Applications, Search Candidates, Shortlist

#### 2.4 `admin-dashboard.html`
- **Purpose**: Administrator main dashboard
- **Features**:
  - User management interface
  - System statistics display
  - Job posting oversight
  - Activity logs
- **Sections**: Users, Statistics, Jobs, Activity

---

## 🛠️ Utility Scripts (8 modules)

#### 1. `seed_skills.py`
- **Purpose**: Populate database with default skills
- **Features**: Seeds 100+ common skills (programming languages, frameworks, tools, soft skills)

#### 2. `seed_jobseekers.py`
- **Purpose**: Create sample job seeker accounts
- **Features**: Generates test users with profiles, skills, and applications

#### 3. `seed_recruiters_companies.py`
- **Purpose**: Create sample recruiter accounts and job postings
- **Features**: Generates companies, recruiters, jobs, and applications

#### 4. `remove_old_jobseekers.py`
- **Purpose**: Clean up old test users
- **Features**: Removes users with specific email patterns

#### 5. `create_database.py`
- **Purpose**: Database initialization script
- **Features**: Creates database schema and initializes tables

#### 6. `startup_check.py`
- **Purpose**: Pre-startup validation
- **Features**: Checks database connectivity, configuration validity

#### 7. `test_api.py`
- **Purpose**: API endpoint testing
- **Features**: Automated tests for API endpoints

#### 8. `test_backend.py`
- **Purpose**: Backend service testing
- **Features**: Unit tests for service functions

---

## 📈 Module Statistics

### By Category
- **Backend Core**: 2 modules
- **API Routes**: 5 modules
- **Business Logic**: 7 modules
- **Data Models**: 4 modules
- **Database**: 2 modules
- **Utilities**: 1 module
- **Frontend JS**: 7 modules
- **Frontend HTML**: 4 modules
- **Scripts**: 8 modules

### By Technology
- **Python**: 21 modules
- **JavaScript**: 7 modules
- **HTML**: 4 modules
- **Configuration**: 2 modules
- **Documentation**: 6+ modules

### By Functionality
- **Authentication**: 3 modules (auth_router, auth_service, auth_models, auth.js)
- **Job Management**: 4 modules (job_service, job_models, jobseeker_router, recruiter_router)
- **Search & AI**: 3 modules (search_service, search_models, search_router)
- **User Management**: 3 modules (user_service, user_models, admin_service)
- **Database**: 2 modules (mysql_connection, chroma_connection)
- **Resume Management**: 2 modules (resume_service, resume features in jobseeker_router)
- **Frontend Dashboards**: 3 modules (dashboard-jobseeker, dashboard-recruiter, dashboard-admin)

---

## 🔗 Module Dependencies

### Backend Dependency Flow
```
main.py
  ├── config.py (Configuration)
  ├── api/* (Routes)
  │   ├── services/* (Business Logic)
  │   │   ├── database/* (Data Access)
  │   │   └── models/* (Validation)
  │   └── utils/dependencies.py (Auth)
  └── database/* (Initialization)
```

### Frontend Dependency Flow
```
index.html / dashboard.html
  ├── scripts/api-client.js (API Communication)
  ├── scripts/auth.js (Authentication)
  ├── scripts/dashboard-*.js (Role-specific logic)
  ├── scripts/utils.js (Shared utilities)
  └── scripts/phone-validation.js (Validation)
```

---

## 📝 Module Responsibilities Summary

### Backend Modules
- **API Layer**: Handle HTTP requests, route to services, return responses
- **Service Layer**: Implement business logic, data processing, validation
- **Model Layer**: Define data structures, validate inputs/outputs
- **Database Layer**: Manage connections, execute queries, handle transactions

### Frontend Modules
- **API Client**: Centralized API communication
- **Auth Module**: User authentication and session management
- **Dashboard Modules**: Role-specific UI logic and interactions
- **Utility Modules**: Reusable functions and helpers

---

## ✅ Module Quality Metrics

- **Total Modules**: 40
- **Code Organization**: Modular, separation of concerns
- **Reusability**: High (shared utilities, API client)
- **Maintainability**: Excellent (clear structure, single responsibility)
- **Testability**: Good (isolated modules, dependency injection)
- **Documentation**: Comprehensive (inline comments, type hints)

---

**Last Updated**: Current Date  
**Version**: 1.0  
**Total Modules**: 40 (21 Python + 7 JavaScript + 4 HTML + 8 Scripts)

