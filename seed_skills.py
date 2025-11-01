"""
Seed script to populate initial skills in the database.
Run this after database initialization to add common skills.
"""

import sys
import os

from backend.database.mysql_connection import MySQLConnection

# Common skills across different industries
COMMON_SKILLS = [
    # Programming Languages
    "Python", "JavaScript", "Java", "C++", "C#", "Ruby", "PHP", "Swift", 
    "Kotlin", "Go", "Rust", "TypeScript", "Scala", "R", "MATLAB",
    
    # Web Development
    "HTML", "CSS", "React", "Angular", "Vue.js", "Node.js", "Express.js",
    "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails",
    "Next.js", "Nuxt.js", "jQuery", "Bootstrap", "Tailwind CSS",
    
    # Mobile Development
    "Android Development", "iOS Development", "React Native", "Flutter",
    "Xamarin", "Ionic",
    
    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "SQL Server",
    "SQLite", "Cassandra", "DynamoDB", "Firebase", "Elasticsearch",
    
    # Cloud & DevOps
    "AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes",
    "Jenkins", "GitLab CI/CD", "Terraform", "Ansible", "Linux",
    
    # Data Science & AI
    "Machine Learning", "Deep Learning", "Data Analysis", "TensorFlow",
    "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Jupyter", "Tableau",
    "Power BI", "Natural Language Processing", "Computer Vision",
    
    # Other Technical
    "Git", "REST API", "GraphQL", "Microservices", "Agile", "Scrum",
    "Test Driven Development", "CI/CD", "System Design", "Algorithms",
    
    # Soft Skills
    "Communication", "Leadership", "Problem Solving", "Team Collaboration",
    "Project Management", "Time Management", "Critical Thinking",
    
    # Design
    "UI/UX Design", "Figma", "Adobe Photoshop", "Adobe Illustrator",
    "Sketch", "InVision", "Wireframing", "Prototyping",
    
    # Business
    "Sales", "Marketing", "Customer Service", "Business Analysis",
    "Financial Analysis", "Strategy", "Product Management",
]


def seed_skills():
    """Seed common skills into the database."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor()
    
    added = 0
    skipped = 0
    
    print("Seeding skills...")
    
    for skill_name in COMMON_SKILLS:
        try:
            cursor.execute(
                "INSERT INTO skills (name) VALUES (%s)",
                (skill_name,)
            )
            added += 1
            print(f"[OK] Added: {skill_name}")
        except Exception as e:
            # Skill already exists
            skipped += 1
            print(f"- Skipped (exists): {skill_name}")
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"\nSeeding complete!")
    print(f"Added: {added} skills")
    print(f"Skipped: {skipped} skills (already existed)")
    print(f"Total in database: {added + skipped} skills")


if __name__ == "__main__":
    print("=" * 60)
    print("SKILL SEEDING SCRIPT")
    print("=" * 60)
    print(f"Will add {len(COMMON_SKILLS)} common skills to the database.")
    print("=" * 60)
    
    try:
        seed_skills()
        print("\n[SUCCESS] Success! Skills have been seeded.")
        print("Users can now search and add these skills to their profiles.")
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        print("Make sure the database is running and tables are created.")
        print("Run 'python run.py' first to initialize the database.")

