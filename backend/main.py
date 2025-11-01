"""
Main FastAPI application entry point.
Handles server initialization, middleware, and route registration.
"""

import os
import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Suppress warnings from gRPC/ALTS before importing Google AI
warnings.filterwarnings('ignore', category=UserWarning)
os.environ['GRPC_VERBOSITY'] = 'ERROR'

from backend.api import auth_router, jobseeker_router, recruiter_router, admin_router, search_router
from backend.database.mysql_connection import init_mysql_db
from backend.database.chroma_connection import init_chroma_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown."""
    # Startup
    print("Starting application...")
    await init_mysql_db()
    init_chroma_db()
    
    # Create default admin account
    from backend.services.admin_service import create_default_admin
    create_default_admin()
    
    print("Application startup complete.")
    
    yield  # Application is running
    
    # Shutdown
    print("Shutting down application...")
    # Add any cleanup code here if needed


# Create FastAPI app instance with lifespan
app = FastAPI(
    title="Hybrid Job Application System",
    description="Full-stack job application platform with AI-powered matching",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"  # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobseeker_router.router, prefix="/api/jobseeker", tags=["Job Seeker"])
app.include_router(recruiter_router.router, prefix="/api/recruiter", tags=["Recruiter"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])
app.include_router(search_router.router, prefix="/api/search", tags=["Search"])




@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Hybrid Job Application System API", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

