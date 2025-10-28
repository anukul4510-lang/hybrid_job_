"""
Script to create the MySQL database for the Hybrid Job Application System.
"""

import mysql.connector
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_database():
    """Create the database if it doesn't exist."""
    try:
        # Connect to MySQL server (without specifying a database)
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', '')
        )
        
        cursor = connection.cursor()
        
        # Create database
        database_name = os.getenv('MYSQL_DATABASE', 'hybrid_job_system')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
        print(f"✓ Database '{database_name}' created successfully!")
        
        cursor.close()
        connection.close()
        
    except mysql.connector.Error as e:
        print(f"✗ Error creating database: {e}")
        raise

if __name__ == "__main__":
    create_database()
