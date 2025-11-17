"""
Seed script to populate job seekers with profiles and skills.
Run this to add sample job seekers to the database.
"""

import sys
import os

from backend.database.mysql_connection import MySQLConnection
from backend.services.auth_service import get_password_hash

# Job seekers data with different job types and corresponding skills
JOB_SEEKERS = [
    {
        "email": "johnsmith123@gmail.com",
        "first_name": "John",
        "last_name": "Smith",
        "phone": "+1-555-0101",
        "location": "San Francisco, CA",
        "address": "123 Market Street, San Francisco, CA 94102",
        "job_of_choice": "Full Stack Developer",
        "bio": "Experienced full stack developer with 5+ years building web applications. Passionate about creating scalable and maintainable code.",
        "skills": ["Python", "JavaScript", "React", "Node.js", "Express.js", "MongoDB", "PostgreSQL", "Git", "REST API", "HTML", "CSS"]
    },
    {
        "email": "sarahjohnson456@gmail.com",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "phone": "+1-555-0102",
        "location": "New York, NY",
        "address": "456 Broadway, New York, NY 10013",
        "job_of_choice": "Data Scientist",
        "bio": "Data scientist specializing in machine learning and predictive analytics. Experienced in building ML models for business insights.",
        "skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Jupyter", "Data Analysis", "Data Science"]
    },
    {
        "email": "michaelchen789@gmail.com",
        "first_name": "Michael",
        "last_name": "Chen",
        "phone": "+1-555-0103",
        "location": "Seattle, WA",
        "address": "789 Pine Street, Seattle, WA 98101",
        "job_of_choice": "Frontend Developer",
        "bio": "Creative frontend developer focused on building beautiful and intuitive user interfaces. Expert in React and modern JavaScript frameworks.",
        "skills": ["JavaScript", "React", "Vue.js", "TypeScript", "HTML", "CSS", "Tailwind CSS", "Next.js", "Bootstrap", "Git", "REST API"]
    },
    {
        "email": "emilyrodriguez2021@gmail.com",
        "first_name": "Emily",
        "last_name": "Rodriguez",
        "phone": "+1-555-0104",
        "location": "Austin, TX",
        "address": "321 Congress Avenue, Austin, TX 78701",
        "job_of_choice": "Mobile App Developer",
        "bio": "Mobile developer with expertise in cross-platform development. Building native and hybrid mobile applications.",
        "skills": ["React Native", "Flutter", "iOS Development", "Android Development", "JavaScript", "Dart", "Swift", "Kotlin", "Git", "REST API"]
    },
    {
        "email": "davidkim987@gmail.com",
        "first_name": "David",
        "last_name": "Kim",
        "phone": "+1-555-0105",
        "location": "Los Angeles, CA",
        "address": "654 Sunset Boulevard, Los Angeles, CA 90028",
        "job_of_choice": "UI/UX Designer",
        "bio": "Creative UI/UX designer passionate about creating user-centered designs. Expert in design systems and prototyping.",
        "skills": ["UI/UX Design", "Figma", "Adobe XD", "Sketch", "Wireframing", "Prototyping", "User Research", "Design Systems", "Adobe Photoshop", "Adobe Illustrator"]
    },
    {
        "email": "lisaanderson321@gmail.com",
        "first_name": "Lisa",
        "last_name": "Anderson",
        "phone": "+1-555-0106",
        "location": "Denver, CO",
        "address": "987 Colfax Avenue, Denver, CO 80202",
        "job_of_choice": "DevOps Engineer",
        "bio": "DevOps engineer with strong background in cloud infrastructure and CI/CD pipelines. Expert in containerization and automation.",
        "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Jenkins", "Terraform", "Ansible", "Linux", "Git", "Bash Scripting", "Nginx"]
    },
    {
        "email": "roberttaylor654@gmail.com",
        "first_name": "Robert",
        "last_name": "Taylor",
        "phone": "+1-555-0107",
        "location": "Boston, MA",
        "address": "147 Beacon Street, Boston, MA 02116",
        "job_of_choice": "Backend Developer",
        "bio": "Backend developer specializing in microservices architecture and API development. Experienced with Java and Spring Boot.",
        "skills": ["Java", "Spring Boot", "Python", "Django", "Flask", "REST API", "GraphQL", "Microservices", "PostgreSQL", "MySQL", "Redis", "Docker"]
    },
    {
        "email": "jenniferwhite88@gmail.com",
        "first_name": "Jennifer",
        "last_name": "White",
        "phone": "+1-555-0108",
        "location": "Chicago, IL",
        "address": "258 Michigan Avenue, Chicago, IL 60601",
        "job_of_choice": "Full Stack Engineer",
        "bio": "Full stack engineer with expertise in both frontend and backend technologies. Building end-to-end web applications.",
        "skills": ["Python", "JavaScript", "TypeScript", "React", "Angular", "Node.js", "Express.js", "FastAPI", "PostgreSQL", "MongoDB", "Docker", "AWS"]
    },
    {
        "email": "jameswilson1995@gmail.com",
        "first_name": "James",
        "last_name": "Wilson",
        "phone": "+1-555-0109",
        "location": "Portland, OR",
        "address": "369 Morrison Street, Portland, OR 97204",
        "job_of_choice": "Java Developer",
        "bio": "Senior Java developer with extensive experience in enterprise applications. Expert in Spring Framework and Hibernate.",
        "skills": ["Java", "Spring Boot", "Spring Framework", "Hibernate", "Maven", "Gradle", "MySQL", "PostgreSQL", "REST API", "Microservices", "Git", "JUnit"]
    },
    {
        "email": "mariagarcia777@gmail.com",
        "first_name": "Maria",
        "last_name": "Garcia",
        "phone": "+1-555-0110",
        "location": "Miami, FL",
        "address": "741 Ocean Drive, Miami, FL 33139",
        "job_of_choice": "Python Developer",
        "bio": "Python developer passionate about clean code and software architecture. Building scalable backend systems.",
        "skills": ["Python", "Django", "Flask", "FastAPI", "PostgreSQL", "MongoDB", "Redis", "Docker", "Git", "REST API", "Test Driven Development", "Pytest"]
    }
]

PASSWORD = "12345678"


def get_skill_id(cursor, skill_name: str) -> int:
    """Get skill ID by name, create if it doesn't exist."""
    cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
    skill = cursor.fetchone()
    
    if skill:
        return skill['id']
    
    # Create skill if it doesn't exist
    cursor.execute("INSERT INTO skills (name) VALUES (%s)", (skill_name,))
    return cursor.lastrowid


def seed_jobseekers():
    """Seed job seekers with profiles and skills into the database."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    added_users = 0
    added_skills = 0
    skipped_users = 0
    
    print("Seeding job seekers...")
    print("=" * 60)
    
    try:
        for seeker_data in JOB_SEEKERS:
            try:
                # Check if user already exists
                cursor.execute("SELECT id FROM users WHERE email = %s", (seeker_data["email"],))
                existing_user = cursor.fetchone()
                
                if existing_user:
                    print(f"[SKIP] User already exists: {seeker_data['email']}")
                    skipped_users += 1
                    continue
                
                # Hash password
                password_hash = get_password_hash(PASSWORD)
                
                # Create user
                cursor.execute(
                    """
                    INSERT INTO users (email, password_hash, role, company_name)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (seeker_data["email"], password_hash, "jobseeker", None)
                )
                user_id = cursor.lastrowid
                
                # Create profile
                cursor.execute(
                    """
                    INSERT INTO user_profiles (user_id, first_name, last_name, phone, location, address, job_of_choice, bio)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        user_id,
                        seeker_data["first_name"],
                        seeker_data["last_name"],
                        seeker_data["phone"],
                        seeker_data["location"],
                        seeker_data["address"],
                        seeker_data["job_of_choice"],
                        seeker_data["bio"]
                    )
                )
                
                # Add skills
                skill_ids_added = 0
                for skill_name in seeker_data["skills"]:
                    try:
                        skill_id = get_skill_id(cursor, skill_name)
                        
                        # Add skill to user (using intermediate proficiency as default)
                        cursor.execute(
                            """
                            INSERT IGNORE INTO user_skills (user_id, skill_id, proficiency_level)
                            VALUES (%s, %s, %s)
                            """,
                            (user_id, skill_id, "intermediate")
                        )
                        if cursor.rowcount > 0:
                            skill_ids_added += 1
                            added_skills += 1
                    except Exception as e:
                        print(f"  - Warning: Could not add skill '{skill_name}': {e}")
                
                conn.commit()
                added_users += 1
                print(f"[OK] Added: {seeker_data['first_name']} {seeker_data['last_name']} ({seeker_data['email']})")
                print(f"     Job: {seeker_data['job_of_choice']}")
                print(f"     Skills: {skill_ids_added}/{len(seeker_data['skills'])} added")
                
            except Exception as e:
                conn.rollback()
                print(f"[ERROR] Failed to add {seeker_data['email']}: {e}")
                continue
        
        print("\n" + "=" * 60)
        print("Seeding complete!")
        print(f"Added: {added_users} job seekers")
        print(f"Skipped: {skipped_users} job seekers (already existed)")
        print(f"Total skills added: {added_skills}")
        print(f"\nAll users have password: {PASSWORD}")
        
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Fatal error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("JOB SEEKER SEEDING SCRIPT")
    print("=" * 60)
    print(f"Will add {len(JOB_SEEKERS)} job seekers with profiles and skills.")
    print("=" * 60)
    
    try:
        seed_jobseekers()
        print("\n[SUCCESS] Job seekers have been seeded successfully!")
        print("You can now log in with any of these emails and password '12345678'")
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        print("Make sure the database is running and tables are created.")
        print("Run 'python run.py' first to initialize the database.")

