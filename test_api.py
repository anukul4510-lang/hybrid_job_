"""
Basic API tests for Hybrid Job Application System.
Run with: pytest test_api.py
"""

import pytest
import requests

API_BASE_URL = "http://localhost:8000/api"

def test_health_check():
    """Test the health check endpoint."""
    response = requests.get("http://localhost:8000/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test the root endpoint."""
    response = requests.get("http://localhost:8000/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_user_registration():
    """Test user registration."""
    user_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "role": "jobseeker"
    }
    # Note: This will fail if user already exists
    response = requests.post(f"{API_BASE_URL}/auth/register", json=user_data)
    # Should be 200 (success) or 400 (user exists)
    assert response.status_code in [200, 400]


def test_api_docs():
    """Test that API docs are accessible."""
    response = requests.get("http://localhost:8000/api/docs")
    assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__])

