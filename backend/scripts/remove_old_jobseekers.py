"""
Script to remove old job seekers with dots and job-related terms in their emails.
"""

from backend.database.mysql_connection import MySQLConnection

# Old email addresses to remove
OLD_EMAILS = [
    "john.smith.jobseeker@gmail.com",
    "sarah.johnson.developer@gmail.com",
    "michael.chen.webdev@gmail.com",
    "emily.rodriguez.mobile@gmail.com",
    "david.kim.designer@gmail.com",
    "lisa.anderson.devops@gmail.com",
    "robert.taylor.backend@gmail.com",
    "jennifer.white.fullstack@gmail.com",
    "james.wilson.java@gmail.com",
    "maria.garcia.python@gmail.com"
]


def remove_old_users():
    """Remove old users with dots and job terms in emails."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    removed_count = 0
    not_found_count = 0
    
    print("Removing old job seekers...")
    print("=" * 60)
    
    try:
        for email in OLD_EMAILS:
            try:
                # Check if user exists
                cursor.execute("SELECT id, email FROM users WHERE email = %s", (email,))
                user = cursor.fetchone()
                
                if not user:
                    print(f"[NOT FOUND] {email}")
                    not_found_count += 1
                    continue
                
                # Delete user (cascade will delete profile, skills, etc.)
                cursor.execute("DELETE FROM users WHERE email = %s", (email,))
                conn.commit()
                
                removed_count += 1
                print(f"[REMOVED] {email}")
                
            except Exception as e:
                conn.rollback()
                print(f"[ERROR] Failed to remove {email}: {e}")
                continue
        
        print("\n" + "=" * 60)
        print("Removal complete!")
        print(f"Removed: {removed_count} users")
        print(f"Not found: {not_found_count} users")
        
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Fatal error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("REMOVE OLD JOB SEEKERS SCRIPT")
    print("=" * 60)
    print(f"Will remove {len(OLD_EMAILS)} old users with dots and job terms in emails.")
    print("=" * 60)
    
    try:
        remove_old_users()
        print("\n[SUCCESS] Old users have been removed successfully!")
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")

