# Project Code Samples - Hybrid Job Application System

This document contains essential code samples demonstrating database connectivity, backend API, and frontend implementation.

---

## 1. Database Connectivity (Python/MySQL)

### 1.1 Database Connection Pool (`backend/database/mysql_connection.py`)

```python
"""
MySQL database connection handler.
Manages connection pool and provides database session.
"""

import mysql.connector
from mysql.connector import pooling
import config


class MySQLConnection:
    """Manages MySQL connection pool."""
    
    _pool: pooling.PooledMySQLConnection = None
    
    @classmethod
    def create_pool(cls):
        """Create MySQL connection pool."""
        try:
            cls._pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="job_app_pool",
                pool_size=10,
                pool_reset_session=True,
                host=config.settings.mysql_host,
                port=config.settings.mysql_port,
                user=config.settings.mysql_user,
                password=config.settings.mysql_password,
                database=config.settings.mysql_database,
                autocommit=True
            )
            print("MySQL connection pool created successfully")
        except mysql.connector.Error as e:
            print(f"Error creating MySQL connection pool: {e}")
            raise
    
    @classmethod
    def get_connection(cls):
        """Get a connection from the pool."""
        if cls._pool is None:
            cls.create_pool()
        return cls._pool.get_connection()
```

### 1.2 Database Query Example - User Registration (`backend/services/auth_service.py`)

```python
from backend.database.mysql_connection import MySQLConnection
from passlib.context import CryptContext
import mysql.connector

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def register_user(user_data: UserCreate) -> dict:
    """
    Register a new user with database connectivity.
    """
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if user already exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (user_data.email,)
        )
        existing_user = cursor.fetchone()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        password_hash = pwd_context.hash(user_data.password)
        
        # Insert user into database
        cursor.execute(
            """
            INSERT INTO users (email, password_hash, role, company_name)
            VALUES (%s, %s, %s, %s)
            """,
            (user_data.email, password_hash, user_data.role, user_data.company_name)
        )
        
        user_id = cursor.lastrowid
        
        # Create profile automatically
        cursor.execute(
            """
            INSERT INTO user_profiles (user_id, first_name, last_name, phone, location)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, user_data.first_name, user_data.last_name, 
             user_data.phone, user_data.location)
        )
        
        conn.commit()
        
        # Fetch the complete user record
        cursor.execute(
            """
            SELECT id, email, role, company_name, created_at
            FROM users WHERE id = %s
            """,
            (user_id,)
        )
        return cursor.fetchone()
        
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()
```

### 1.3 Database Query Example - Job Posting Creation (`backend/services/job_service.py`)

```python
from backend.database.mysql_connection import MySQLConnection
import mysql.connector

def create_job_posting(recruiter_id: int, job_data: JobPostingCreate) -> dict:
    """Create a new job posting with database operations."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Insert job posting
        cursor.execute(
            """
            INSERT INTO job_postings 
            (recruiter_id, title, company, description, location, employment_type, 
             min_salary, max_salary, application_deadline)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (recruiter_id, job_data.title, job_data.company, job_data.description,
             job_data.location, job_data.employment_type, job_data.min_salary,
             job_data.max_salary, job_data.application_deadline)
        )
        
        job_id = cursor.lastrowid
        
        # Add required skills (many-to-many relationship)
        for skill_id in job_data.required_skills:
            cursor.execute(
                "INSERT INTO job_skills (job_id, skill_id, required) VALUES (%s, %s, TRUE)",
                (job_id, skill_id)
            )
        
        conn.commit()
        
        # Fetch the created job
        cursor.execute(
            "SELECT * FROM job_postings WHERE id = %s",
            (job_id,)
        )
        return cursor.fetchone()
        
    except mysql.connector.Error as e:
        conn.rollback()
        raise ValueError(f"Database error: {e}")
    finally:
        cursor.close()
        conn.close()
```

---

## 2. Backend API (FastAPI)

### 2.1 Authentication Router (`backend/api/auth_router.py`)

```python
"""
Authentication API routes.
Handles user registration, login, and token management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from backend.models.auth_models import UserCreate, UserLogin, Token, TokenData
from backend.services.auth_service import (
    register_user, authenticate_user, create_access_token
)
from backend.utils.dependencies import get_current_user

router = APIRouter()

@router.post("/register")
async def register(user_data: UserCreate):
    """
    Register a new user.
    """
    try:
        user = register_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Authenticate user and return JWT token.
    """
    user = authenticate_user(user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"]
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """
    Get current authenticated user information.
    """
    return current_user
```

### 2.2 Job Seeker Router (`backend/api/jobseeker_router.py`)

```python
"""
Job seeker API routes.
Handles profile management, job browsing, and applications.
"""

from fastapi import APIRouter, HTTPException, Depends
from backend.models.user_models import UserProfileCreate, UserProfileUpdate
from backend.models.job_models import ApplicationCreate
from backend.services.user_service import (
    create_user_profile, get_user_profile, update_user_profile
)
from backend.services.job_service import (
    get_all_job_postings, create_application, get_user_applications
)
from backend.utils.dependencies import get_current_user, TokenData

router = APIRouter()

@router.post("/profile")
async def create_profile(
    profile_data: UserProfileCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create or update user profile."""
    try:
        profile = create_user_profile(current_user.user_id, profile_data)
        return profile
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/jobs")
async def browse_jobs(current_user: TokenData = Depends(get_current_user)):
    """Browse all available job postings."""
    try:
        jobs = get_all_job_postings()
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/applications")
async def apply_to_job(
    application_data: ApplicationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Apply to a job posting."""
    try:
        application = create_application(current_user.user_id, application_data)
        return application
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/applications")
async def get_my_applications(current_user: TokenData = Depends(get_current_user)):
    """Get all applications for current user."""
    try:
        applications = get_user_applications(current_user.user_id)
        return {"applications": applications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 2.3 Main Application Setup (`backend/main.py`)

```python
"""
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import auth_router, jobseeker_router, recruiter_router
from backend.database.mysql_connection import init_mysql_db

app = FastAPI(title="Hybrid Job Application System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["authentication"])
app.include_router(jobseeker_router.router, prefix="/api/jobseeker", tags=["jobseeker"])
app.include_router(recruiter_router.router, prefix="/api/recruiter", tags=["recruiter"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await init_mysql_db()

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Hybrid Job Application System API"}
```

---

## 3. Frontend JavaScript

### 3.1 API Client (`scripts/api-client.js`)

```javascript
/**
 * API Client Module
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
    /**
     * Get authentication token from localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Save authentication token to localStorage
     */
    setToken(token) {
        localStorage.setItem('token', token);
    }

    /**
     * Get request headers with authentication
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                    return;
                }
                throw new Error(data.detail || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    // Job seeker endpoints
    async getJobs() {
        return this.request('/jobseeker/jobs');
    }

    async applyToJob(jobId, coverLetter) {
        return this.request('/jobseeker/applications', {
            method: 'POST',
            body: JSON.stringify({
                job_id: jobId,
                cover_letter: coverLetter
            }),
        });
    }

    async getMyApplications() {
        return this.request('/jobseeker/applications');
    }

    async getProfile() {
        return this.request('/jobseeker/profile');
    }

    async updateProfile(profileData) {
        return this.request('/jobseeker/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }
}

// Export singleton instance
const apiClient = new ApiClient();
```

### 3.2 Authentication Handler (`scripts/auth.js`)

```javascript
/**
 * Authentication handling module
 */

// Initialize API client
const apiClient = new ApiClient();

/**
 * Handle user login
 */
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await apiClient.login({ email, password });
        
        // Save token
        apiClient.setToken(response.access_token);
        localStorage.setItem('user_email', email);
        
        // Redirect based on role
        const tokenData = parseJWT(response.access_token);
        localStorage.setItem('user_role', tokenData.role);
        
        if (tokenData.role === 'jobseeker') {
            window.location.href = 'jobseeker-dashboard.html';
        } else if (tokenData.role === 'recruiter') {
            window.location.href = 'recruiter-dashboard.html';
        } else {
            window.location.href = 'admin-dashboard.html';
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

/**
 * Handle user registration
 */
async function handleRegister() {
    const userData = {
        email: document.getElementById('register-email').value,
        password: document.getElementById('register-password').value,
        role: document.getElementById('register-role').value || 'jobseeker',
        first_name: document.getElementById('register-first-name').value,
        last_name: document.getElementById('register-last-name').value,
        phone: document.getElementById('register-phone').value,
        location: document.getElementById('register-location').value,
        company_name: document.getElementById('register-company')?.value || null
    };

    try {
        await apiClient.register(userData);
        alert('Registration successful! Please login.');
        showLogin();
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}

/**
 * Parse JWT token to get user data
 */
function parseJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
```

### 3.3 Dashboard Functionality (`scripts/dashboard-jobseeker.js` - Sample)

```javascript
/**
 * Job Seeker Dashboard functionality
 */

const apiClient = new ApiClient();

/**
 * Load and display jobs
 */
async function loadJobs() {
    try {
        const response = await apiClient.getJobs();
        const jobs = response.jobs || [];
        
        const jobsContainer = document.getElementById('jobs-container');
        jobsContainer.innerHTML = '';
        
        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<p>No jobs available.</p>';
            return;
        }
        
        jobs.forEach(job => {
            const jobCard = createJobCard(job);
            jobsContainer.appendChild(jobCard);
        });
    } catch (error) {
        console.error('Failed to load jobs:', error);
        alert('Failed to load jobs: ' + error.message);
    }
}

/**
 * Create job card element
 */
function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
        <h3>${job.title}</h3>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Location:</strong> ${job.location || 'Not specified'}</p>
        <p><strong>Type:</strong> ${job.employment_type}</p>
        <p><strong>Salary:</strong> $${job.min_salary || 'N/A'} - $${job.max_salary || 'N/A'}</p>
        <p>${job.description.substring(0, 200)}...</p>
        <button onclick="applyToJob(${job.id})" class="btn btn-primary">Apply Now</button>
    `;
    return card;
}

/**
 * Apply to a job
 */
async function applyToJob(jobId) {
    const coverLetter = prompt('Enter your cover letter (optional):');
    
    try {
        await apiClient.applyToJob(jobId, coverLetter || '');
        alert('Application submitted successfully!');
        loadMyApplications();
    } catch (error) {
        alert('Failed to apply: ' + error.message);
    }
}

/**
 * Load user's applications
 */
async function loadMyApplications() {
    try {
        const response = await apiClient.getMyApplications();
        const applications = response.applications || [];
        
        const appsContainer = document.getElementById('applications-container');
        appsContainer.innerHTML = '';
        
        applications.forEach(app => {
            const appCard = document.createElement('div');
            appCard.className = 'application-card';
            appCard.innerHTML = `
                <h3>${app.job_title}</h3>
                <p><strong>Company:</strong> ${app.company}</p>
                <p><strong>Status:</strong> <span class="status-${app.status}">${app.status}</span></p>
                <p><strong>Applied:</strong> ${new Date(app.applied_date).toLocaleDateString()}</p>
            `;
            appsContainer.appendChild(appCard);
        });
    } catch (error) {
        console.error('Failed to load applications:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    loadMyApplications();
});
```

---

## 4. Frontend HTML

### 4.1 Main Login/Register Page (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hybrid Job Application System</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>HYBRID JOB APPLICATION SYSTEM</h1>
            <p>AI-Powered Job Matching Platform</p>
        </header>

        <nav id="navigation">
            <button onclick="window.location.href='index.html'" class="nav-btn active">Home</button>
            <button onclick="showLogin()" class="nav-btn">Login</button>
            <button onclick="showRegister()" class="nav-btn">Register</button>
        </nav>

        <main>
            <!-- Login Form -->
            <section id="login-section" class="auth-section">
                <h2>Login</h2>
                <form id="login-form" onsubmit="event.preventDefault(); handleLogin();">
                    <div class="form-group">
                        <label for="login-email">Email:</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password:</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Login</button>
                </form>
                <p class="switch-auth">
                    Don't have an account? <a href="#" onclick="showRegister()">Register</a>
                </p>
            </section>

            <!-- Registration Form -->
            <section id="register-section" class="auth-section hidden">
                <h2>Register</h2>
                <form id="register-form" onsubmit="event.preventDefault(); handleRegister();">
                    <div class="form-group">
                        <label for="register-email">Email:</label>
                        <input type="email" id="register-email" required>
                    </div>
                    <div class="form-group">
                        <label for="register-password">Password:</label>
                        <input type="password" id="register-password" required>
                    </div>
                    <div class="form-group">
                        <label for="register-role">Role:</label>
                        <select id="register-role" required>
                            <option value="jobseeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="register-first-name">First Name:</label>
                        <input type="text" id="register-first-name" required>
                    </div>
                    <div class="form-group">
                        <label for="register-last-name">Last Name:</label>
                        <input type="text" id="register-last-name" required>
                    </div>
                    <div class="form-group">
                        <label for="register-phone">Phone:</label>
                        <input type="tel" id="register-phone">
                    </div>
                    <div class="form-group">
                        <label for="register-location">Location:</label>
                        <input type="text" id="register-location">
                    </div>
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
                <p class="switch-auth">
                    Already have an account? <a href="#" onclick="showLogin()">Login</a>
                </p>
            </section>
        </main>
    </div>

    <script src="scripts/api-client.js"></script>
    <script src="scripts/auth.js"></script>
</body>
</html>
```

### 4.2 Job Seeker Dashboard (`jobseeker-dashboard.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Seeker Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Job Seeker Dashboard</h1>
            <button onclick="logout()" class="btn btn-secondary">Logout</button>
        </header>

        <nav>
            <button onclick="showSection('jobs')" class="nav-btn active">Browse Jobs</button>
            <button onclick="showSection('applications')" class="nav-btn">My Applications</button>
            <button onclick="showSection('profile')" class="nav-btn">Profile</button>
        </nav>

        <main>
            <!-- Browse Jobs Section -->
            <section id="jobs-section" class="content-section">
                <h2>Available Jobs</h2>
                <div id="jobs-container">
                    <!-- Jobs will be loaded here -->
                </div>
            </section>

            <!-- Applications Section -->
            <section id="applications-section" class="content-section hidden">
                <h2>My Applications</h2>
                <div id="applications-container">
                    <!-- Applications will be loaded here -->
                </div>
            </section>

            <!-- Profile Section -->
            <section id="profile-section" class="content-section hidden">
                <h2>My Profile</h2>
                <form id="profile-form" onsubmit="event.preventDefault(); updateProfile();">
                    <div class="form-group">
                        <label for="profile-first-name">First Name:</label>
                        <input type="text" id="profile-first-name">
                    </div>
                    <div class="form-group">
                        <label for="profile-last-name">Last Name:</label>
                        <input type="text" id="profile-last-name">
                    </div>
                    <div class="form-group">
                        <label for="profile-phone">Phone:</label>
                        <input type="tel" id="profile-phone">
                    </div>
                    <div class="form-group">
                        <label for="profile-location">Location:</label>
                        <input type="text" id="profile-location">
                    </div>
                    <div class="form-group">
                        <label for="profile-bio">Bio:</label>
                        <textarea id="profile-bio" rows="5"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Update Profile</button>
                </form>
            </section>
        </main>
    </div>

    <script src="scripts/api-client.js"></script>
    <script src="scripts/dashboard-jobseeker.js"></script>
</body>
</html>
```

---

## 5. Database Schema (SQL)

### 5.1 Core Tables Creation

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('jobseeker', 'recruiter', 'admin') NOT NULL DEFAULT 'jobseeker',
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    location VARCHAR(255),
    address TEXT,
    job_of_choice VARCHAR(255),
    bio TEXT,
    years_experience INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- User skills junction table
CREATE TABLE IF NOT EXISTS user_skills (
    user_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Job postings table
CREATE TABLE IF NOT EXISTS job_postings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recruiter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    employment_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
    min_salary DECIMAL(10, 2),
    max_salary DECIMAL(10, 2),
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_deadline DATE,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobseeker_id INT NOT NULL,
    job_id INT NOT NULL,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jobseeker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (jobseeker_id, job_id)
);
```

---

## 6. Key Features Demonstrated

### Database Connectivity
- ✅ Connection pooling for performance
- ✅ Parameterized queries for security
- ✅ Transaction management (commit/rollback)
- ✅ Error handling

### Backend API
- ✅ RESTful endpoints
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation with Pydantic

### Frontend JavaScript
- ✅ API client with token management
- ✅ Async/await for HTTP requests
- ✅ Dynamic DOM manipulation
- ✅ LocalStorage for session management

### HTML Structure
- ✅ Semantic HTML5
- ✅ Form handling
- ✅ Responsive layout structure
- ✅ Dynamic content sections

---

## 7. Technology Stack

- **Backend**: Python 3.x, FastAPI, MySQL
- **Frontend**: HTML5, JavaScript (ES6+), CSS3
- **Database**: MySQL with connection pooling
- **Authentication**: JWT tokens, bcrypt password hashing
- **API Communication**: RESTful APIs, Fetch API

---

## 8. Setup Instructions

1. **Database Setup**: Create MySQL database and run schema creation scripts
2. **Backend Setup**: Install Python dependencies (`pip install -r requirements.txt`)
3. **Frontend Setup**: Serve HTML files via web server or directly open in browser
4. **Configuration**: Update database credentials in `config.py`

---

This code demonstrates a complete full-stack job application system with database connectivity, RESTful API, and modern frontend implementation.

