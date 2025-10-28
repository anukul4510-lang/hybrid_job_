"""
Run script for the Hybrid Job Application System.
Starts the FastAPI server with Uvicorn.
"""

import uvicorn

if __name__ == "__main__":
    print("Starting Hybrid Job Application System...")
    print("Backend API will be available at: http://127.0.0.1:8000")
    print("API Documentation: http://127.0.0.1:8000/api/docs")
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True  # Enable reload for development
    )

