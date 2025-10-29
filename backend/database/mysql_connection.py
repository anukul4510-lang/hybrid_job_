"""
MySQL database connection handler.
Manages connection pool and provides database session.
"""

import mysql.connector
from mysql.connector import pooling
from typing import Generator
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
    
    @classmethod
    def get_cursor(cls):
        """Get a cursor from the pool."""
        conn = cls.get_connection()
        return conn.cursor(dictionary=True)


async def init_mysql_db():
    """Initialize MySQL database and create tables if needed."""
    try:
        MySQLConnection.create_pool()
        await create_tables()
        print("MySQL database initialized successfully")
    except Exception as e:
        print(f"Error initializing MySQL database: {e}")


async def create_tables():
    """Create database tables if they don't exist."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('jobseeker', 'recruiter', 'admin') NOT NULL DEFAULT 'jobseeker',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    
    # User profiles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            phone VARCHAR(20),
            location VARCHAR(255),
            bio TEXT,
            profile_picture VARCHAR(500),
            resume_url VARCHAR(500),
            linkedin_url VARCHAR(500),
            portfolio_url VARCHAR(500),
            years_experience INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Skills table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        )
    """)
    
    # User skills junction table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_skills (
            user_id INT NOT NULL,
            skill_id INT NOT NULL,
            proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
            PRIMARY KEY (user_id, skill_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        )
    """)
    
    # Job postings table
    cursor.execute("""
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
        )
    """)
    
    # Job skills junction table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS job_skills (
            job_id INT NOT NULL,
            skill_id INT NOT NULL,
            required BOOLEAN DEFAULT TRUE,
            PRIMARY KEY (job_id, skill_id),
            FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        )
    """)
    
    # Applications table
    cursor.execute("""
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
        )
    """)
    
    # Saved jobs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS saved_jobs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            jobseeker_id INT NOT NULL,
            job_id INT NOT NULL,
            saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (jobseeker_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
            UNIQUE KEY unique_saved_job (jobseeker_id, job_id)
        )
    """)
    
    # Notifications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'info',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Resumes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255),
            content TEXT,
            file_url VARCHAR(500),
            is_primary BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # System settings table for admin
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(100) UNIQUE NOT NULL,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    """)
    
    # Admin activity log
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(255) NOT NULL,
            target_type VARCHAR(50),
            target_id INT,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)
    
    # Shortlisted candidates table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shortlisted_candidates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recruiter_id INT NOT NULL,
            candidate_id INT NOT NULL,
            job_id INT,
            match_score DECIMAL(5, 2),
            notes TEXT,
            status ENUM('shortlisted', 'contacted', 'interviewing', 'rejected', 'hired') DEFAULT 'shortlisted',
            shortlisted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE SET NULL,
            UNIQUE KEY unique_shortlist (recruiter_id, candidate_id)
        )
    """)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Database tables created successfully")

