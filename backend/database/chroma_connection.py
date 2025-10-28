"""
ChromaDB connection handler for vector embeddings.
Manages persistent vector database for semantic search.
"""

import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Optional
import config


class ChromaConnection:
    """Manages ChromaDB connection and collections."""
    
    _client: chromadb.Client = None
    _collection_jobs: chromadb.Collection = None
    _collection_resumes: chromadb.Collection = None
    
    @classmethod
    def initialize(cls):
        """Initialize ChromaDB client and create collections."""
        try:
            cls._client = chromadb.PersistentClient(
                path=config.settings.chroma_persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            
            # Create or get collection for job embeddings
            cls._collection_jobs = cls._client.get_or_create_collection(
                name="job_postings",
                metadata={"description": "Job posting embeddings for semantic search"}
            )
            
            # Create or get collection for resume embeddings
            cls._collection_resumes = cls._client.get_or_create_collection(
                name="resumes",
                metadata={"description": "Resume embeddings for candidate matching"}
            )
            
            print("ChromaDB initialized successfully")
        except Exception as e:
            print(f"Error initializing ChromaDB: {e}")
            raise
    
    @classmethod
    def get_jobs_collection(cls):
        """Get the job postings collection."""
        if cls._client is None:
            cls.initialize()
        return cls._collection_jobs
    
    @classmethod
    def get_resumes_collection(cls):
        """Get the resumes collection."""
        if cls._client is None:
            cls.initialize()
        return cls._collection_resumes
    
    @classmethod
    def add_job_embedding(cls, job_id: int, text: str, embedding: List[float], metadata: Dict):
        """Add a job posting embedding."""
        collection = cls.get_jobs_collection()
        collection.add(
            ids=[f"job_{job_id}"],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )
    
    @classmethod
    def add_resume_embedding(cls, resume_id: int, text: str, embedding: List[float], metadata: Dict):
        """Add a resume embedding."""
        collection = cls.get_resumes_collection()
        collection.add(
            ids=[f"resume_{resume_id}"],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )
    
    @classmethod
    def search_jobs(cls, query_embedding: List[float], n_results: int = 10, filters: Optional[Dict] = None):
        """Search for jobs using vector similarity."""
        collection = cls.get_jobs_collection()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=filters
        )
        return results
    
    @classmethod
    def search_resumes(cls, query_embedding: List[float], n_results: int = 10, filters: Optional[Dict] = None):
        """Search for resumes using vector similarity."""
        collection = cls.get_resumes_collection()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=filters
        )
        return results
    
    @classmethod
    def delete_job_embedding(cls, job_id: int):
        """Delete a job posting embedding."""
        collection = cls.get_jobs_collection()
        collection.delete(ids=[f"job_{job_id}"])
    
    @classmethod
    def delete_resume_embedding(cls, resume_id: int):
        """Delete a resume embedding."""
        collection = cls.get_resumes_collection()
        collection.delete(ids=[f"resume_{resume_id}"])


def init_chroma_db():
    """Initialize ChromaDB connection."""
    try:
        ChromaConnection.initialize()
    except Exception as e:
        print(f"Error initializing ChromaDB: {e}")

