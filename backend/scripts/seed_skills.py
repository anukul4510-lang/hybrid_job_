"""
Standalone script to seed the database with default skills.
Can be run independently to add skills to the database.
"""

import sys
import os

# Add project root directory to path to import backend modules
# This allows running the script from the project root (c:\cruz)
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
project_root = os.path.dirname(backend_dir)
sys.path.insert(0, project_root)

from backend.database.mysql_connection import MySQLConnection
import mysql.connector


def seed_skills():
    """Seed the database with common/default skills."""
    # Comprehensive list of common skills
    default_skills = [
        # Programming Languages
        "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "Swift", 
        "Kotlin", "PHP", "Ruby", "TypeScript", "Scala", "R", "MATLAB", "Perl",
        
        # Web Development
        "HTML", "CSS", "React", "Vue.js", "Angular", "Node.js", "Express.js",
        "Django", "Flask", "Spring Boot", "ASP.NET", "Laravel", "Rails",
        "Next.js", "Nuxt.js", "Svelte", "jQuery", "Bootstrap", "Tailwind CSS",
        
        # Databases
        "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server",
        "Cassandra", "Elasticsearch", "DynamoDB", "Firebase", "Supabase",
        
        # Cloud & DevOps
        "AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Jenkins",
        "CI/CD", "Terraform", "Ansible", "Git", "GitHub", "GitLab", "Linux",
        "Bash Scripting", "Shell Scripting", "Nginx", "Apache",
        
        # Mobile Development
        "iOS Development", "Android Development", "React Native", "Flutter",
        "Xamarin", "SwiftUI", "Kotlin Multiplatform",
        
        # Data Science & AI
        "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
        "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "SciPy",
        "Natural Language Processing", "Computer Vision", "Big Data", "Hadoop",
        "Spark", "Tableau", "Power BI", "Jupyter",
        
        # Backend & APIs
        "REST API", "GraphQL", "Microservices", "API Design", "RESTful Services",
        "WebSocket", "gRPC", "FastAPI", "API Gateway",
        
        # Testing
        "Unit Testing", "Integration Testing", "Test-Driven Development",
        "Jest", "Pytest", "Selenium", "Cypress", "JUnit",
        
        # Design & UI/UX
        "UI/UX Design", "Figma", "Adobe XD", "Sketch", "Wireframing", "Prototyping",
        "User Research", "Design Systems", "Material Design",
        
        # Project Management & Tools
        "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Project Management",
        "Version Control", "Git Workflow",
        
        # Soft Skills
        "Communication", "Leadership", "Teamwork", "Problem Solving",
        "Critical Thinking", "Time Management", "Collaboration", "Adaptability",
        "Presentation Skills", "Customer Service",
        
        # Business & Marketing
        "Digital Marketing", "SEO", "SEM", "Content Marketing", "Social Media Marketing",
        "Analytics", "Google Analytics", "Business Analysis",
        
        # Other Technical Skills
        "Blockchain", "Web3", "Solidity", "Smart Contracts", "Cryptography",
        "Cybersecurity", "Network Security", "Penetration Testing",
        "System Design", "Architecture", "Code Review", "Debugging",
        "Performance Optimization", "Scaling", "Load Balancing",
        
        # Domain-Specific
        "E-commerce", "FinTech", "HealthTech", "EdTech", "SaaS",
        "CRM", "ERP", "Salesforce", "HubSpot",
        
        # Additional Modern Skills
        "Webpack", "Vite", "NPM", "Yarn", "Package Management",
        "Responsive Design", "Progressive Web Apps", "Serverless",
        "Lambda Functions", "Cloud Functions", "Edge Computing",
        
        # Quality Assurance
        "QA Testing", "Manual Testing", "Automated Testing", "Performance Testing",
        "Security Testing", "Regression Testing",
        
        # Content & Documentation
        "Technical Writing", "Documentation", "Content Creation", "Blogging",
        "Copywriting",
        
        # Additional Languages
        "Dart", "Lua", "Haskell", "Erlang", "Elixir", "Clojure",
        
        # Additional Frameworks & Libraries
        "Redux", "MobX", "Zustand", "Three.js", "D3.js", "Chart.js",
        "Material-UI", "Ant Design", "Chakra UI",
    ]
    
    try:
        conn = MySQLConnection.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Insert skills if they don't exist (using INSERT IGNORE to skip duplicates)
        skills_inserted = 0
        skills_skipped = 0
        
        for skill in default_skills:
            try:
                cursor.execute(
                    "INSERT IGNORE INTO skills (name) VALUES (%s)",
                    (skill,)
                )
                if cursor.rowcount > 0:
                    skills_inserted += 1
                else:
                    skills_skipped += 1
            except mysql.connector.Error as e:
                # Skip if error occurs
                skills_skipped += 1
                print(f"Warning: Could not insert skill '{skill}': {e}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\n[SUCCESS] Skill seeding completed!")
        print(f"   [INFO] New skills added: {skills_inserted}")
        print(f"   [INFO] Skills skipped (already exist): {skills_skipped}")
        print(f"   [INFO] Total skills in database: {skills_inserted + skills_skipped}")
        
        return skills_inserted
        
    except mysql.connector.Error as e:
        print(f"[ERROR] Error seeding skills: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return 0
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return 0


if __name__ == "__main__":
    print("[INIT] Starting skill seeding process...")
    print("   This may take a moment...\n")
    
    seed_skills()

