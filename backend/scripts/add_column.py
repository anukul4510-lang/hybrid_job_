"""
Script to add missing columns to user_profiles table
"""
import mysql.connector
from backend.database.mysql_connection import MySQLConnection

def add_missing_columns():
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    # List of columns to add
    columns_to_add = [
        ('years_experience', 'INT DEFAULT 0'),
        ('resume_url', 'VARCHAR(500)'),
        ('linkedin_url', 'VARCHAR(500)'),
        ('portfolio_url', 'VARCHAR(500)'),
        ('profile_picture', 'VARCHAR(500)')
    ]
    
    try:
        for column_name, column_definition in columns_to_add:
            # Check if column exists
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE table_schema = 'hybrid_job_system' 
                AND table_name = 'user_profiles' 
                AND column_name = %s
            """, (column_name,))
            result = cursor.fetchone()
            
            if result[0] == 0:
                print(f"Adding {column_name} column...")
                cursor.execute(f"""
                    ALTER TABLE user_profiles 
                    ADD COLUMN {column_name} {column_definition}
                """)
                conn.commit()
                print(f"[OK] {column_name} column added successfully")
            else:
                print(f"[OK] {column_name} column already exists")
            
    except mysql.connector.Error as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_missing_columns()
