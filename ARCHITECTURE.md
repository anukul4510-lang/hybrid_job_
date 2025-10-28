# System Architecture

## Overview

The Hybrid Job Application System follows a clean, modular architecture with clear separation of concerns.

## Architecture Layers

### 1. Presentation Layer (Frontend)
- **Technology**: Vanilla JavaScript ES6, HTML5, CSS3
- **Components**: 
  - Modular JavaScript files (api-client, auth, dashboards, utils)
  - HTML5 pages for each user role
  - Responsive CSS with modern design
- **Communication**: Fetch API with JWT authentication

### 2. API Layer (Backend)
- **Framework**: FastAPI with async support
- **Features**:
  - RESTful API design
  - JWT authentication middleware
  - Role-based access control
  - Automatic API documentation (Swagger UI)
- **Modules**: auth_router, jobseeker_router, recruiter_router, admin_router, search_router

### 3. Business Logic Layer (Services)
- **Purpose**: Encapsulate business rules and data processing
- **Services**:
  - `auth_service`: Authentication, password hashing, JWT
  - `user_service`: Profile management, skills
  - `job_service`: Job postings, applications
  - `search_service`: Hybrid search, recommendations
- **Principles**: Single Responsibility, Dependency Injection

### 4. Data Access Layer
- **MySQL**: Relational data storage
  - Connection pooling for performance
  - Transaction management
  - Schema: users, profiles, jobs, applications
  
- **ChromaDB**: Vector embeddings storage
  - Semantic search indices
  - Job and resume embeddings
  - Persistent storage on disk

### 5. External Integration
- **Gemini AI**: Natural language to embeddings
- **Authentication**: JWT tokens with bcrypt
- **Search**: Hybrid SQL + Vector search

## Data Flow

### User Registration/Login
```
1. Frontend → POST /api/auth/register
2. Backend → auth_service.register_user()
3. Backend → Database (MySQL) insert
4. Return JWT token to frontend
5. Frontend stores token in LocalStorage
```

### Job Search (Hybrid)
```
1. User enters query → Frontend
2. POST /api/search/hybrid
3. search_service.hybrid_search():
   - Query → Gemini API → Embedding
   - ChromaDB vector search → Similar jobs
   - MySQL SQL filtering → Refine results
4. Return ranked results
```

### Job Application
```
1. User clicks Apply → Frontend
2. POST /api/jobseeker/applications
3. job_service.create_application()
4. MySQL insert application record
5. Return confirmation
```

## Security

### Authentication Flow
1. User logs in with email/password
2. Server verifies password (bcrypt)
3. Generate JWT with user ID, email, role
4. Token sent to frontend
5. Frontend includes token in all requests
6. Server validates token on protected routes

### Authorization
- **Role-based**: jobseeker, recruiter, admin
- **Resource-based**: Users can only modify their own resources
- **JWT Claims**: User ID and role embedded in token

## Database Schema

### Core Tables
- `users`: Authentication (id, email, password_hash, role)
- `user_profiles`: User information (first_name, last_name, etc.)
- `skills`: Available skills
- `user_skills`: User-skill associations
- `job_postings`: Job details
- `job_skills`: Required skills for jobs
- `applications`: Job applications
- `saved_jobs`: User's saved jobs

### Relationships
- One-to-one: User → Profile
- Many-to-many: User ↔ Skills, Job ↔ Skills
- One-to-many: User → Applications, Job → Applications

## Scalability Considerations

### Backend
- Connection pooling for MySQL
- Async endpoints for concurrent requests
- Modular code for easy horizontal scaling
- Stateless JWT tokens for load balancing

### Frontend
- Client-side state management
- Minimal server round trips
- Caching with LocalStorage
- Responsive design for all devices

### Database
- Indexed columns for fast queries
- Vector search for semantic matching
- Connection pooling for efficiency

## Future Enhancements

### Potential Additions
1. Real-time notifications (WebSockets)
2. Resume parsing and auto-extraction
3. Advanced analytics dashboard
4. Email notifications
5. File upload for resumes
6. Multi-tenancy for companies
7. Advanced AI matching algorithms
8. Integration with external job boards

### Performance Optimizations
1. Redis caching layer
2. Database query optimization
3. CDN for static assets
4. Lazy loading of job listings
5. Compression and minification

## Technology Decisions

### Why FastAPI?
- High performance (comparable to Node.js)
- Automatic API documentation
- Python type hints for better code quality
- Native async support
- Easy testing and development

### Why ChromaDB?
- Open-source and free
- Persistent storage
- Good performance for vector search
- Easy integration with Python

### Why Gemini AI?
- Powerful embedding models
- Easy API integration
- Good for semantic understanding
- Real-time embedding generation

### Why Vanilla JavaScript?
- No build step required
- Full control over code
- Fast development cycle
- Modern ES6+ features
- Better for understanding the system

## Deployment Considerations

### Production Checklist
- [ ] Change JWT secret key
- [ ] Use production database credentials
- [ ] Configure CORS for specific domains
- [ ] Set up SSL/TLS certificates
- [ ] Use production ASGI server (gunicorn/uvicorn)
- [ ] Configure logging
- [ ] Set up monitoring and alerts
- [ ] Database backups
- [ ] Rate limiting
- [ ] Environment variable management

