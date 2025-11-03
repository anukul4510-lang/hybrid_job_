"""
Seed script to populate recruiters, companies, job postings, and applications.
"""

from backend.database.mysql_connection import MySQLConnection
from backend.services.auth_service import get_password_hash
from datetime import date, timedelta

PASSWORD = "12345678"

# Companies and recruiters data
COMPANIES = [
    {
        "email": "techcorp2024@gmail.com",
        "company_name": "TechCorp Solutions",
        "first_name": "Alex",
        "last_name": "Martinez",
        "phone": "+1-555-2001",
        "location": "San Francisco, CA",
        "address": "100 Tech Boulevard, San Francisco, CA 94105",
        "jobs": [
            {
                "title": "Senior Full Stack Developer",
                "description": "We are looking for an experienced full stack developer to join our team. You'll work on cutting-edge web applications using modern technologies. Responsibilities include designing and implementing scalable solutions, collaborating with cross-functional teams, and maintaining high code quality standards.",
                "location": "San Francisco, CA",
                "employment_type": "full-time",
                "min_salary": 120000.00,
                "max_salary": 180000.00,
                "application_deadline": date.today() + timedelta(days=30),
                "required_skills": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"]
            },
            {
                "title": "Frontend Developer",
                "description": "Join our frontend team to build beautiful and intuitive user interfaces. You'll work with React, TypeScript, and modern CSS frameworks to create responsive and accessible web applications. Experience with state management and API integration required.",
                "location": "San Francisco, CA",
                "employment_type": "full-time",
                "min_salary": 90000.00,
                "max_salary": 140000.00,
                "application_deadline": date.today() + timedelta(days=25),
                "required_skills": ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Tailwind CSS"]
            }
        ]
    },
    {
        "email": "datainnovate99@gmail.com",
        "company_name": "DataInnovate Inc",
        "first_name": "Patricia",
        "last_name": "Lee",
        "phone": "+1-555-2002",
        "location": "New York, NY",
        "address": "200 Data Street, New York, NY 10001",
        "jobs": [
            {
                "title": "Data Scientist",
                "description": "We're seeking a talented data scientist to join our analytics team. You'll work with large datasets, build machine learning models, and provide actionable insights to stakeholders. Experience with Python, TensorFlow, and data visualization tools required.",
                "location": "New York, NY",
                "employment_type": "full-time",
                "min_salary": 130000.00,
                "max_salary": 190000.00,
                "application_deadline": date.today() + timedelta(days=35),
                "required_skills": ["Python", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "Data Analysis", "Jupyter"]
            }
        ]
    },
    {
        "email": "cloudsystems456@gmail.com",
        "company_name": "CloudSystems",
        "first_name": "Ryan",
        "last_name": "Thompson",
        "phone": "+1-555-2003",
        "location": "Seattle, WA",
        "address": "300 Cloud Avenue, Seattle, WA 98101",
        "jobs": [
            {
                "title": "DevOps Engineer",
                "description": "We need an experienced DevOps engineer to manage our cloud infrastructure. You'll work with Docker, Kubernetes, AWS, and CI/CD pipelines to ensure reliable and scalable deployments. Linux and scripting experience essential.",
                "location": "Seattle, WA",
                "employment_type": "full-time",
                "min_salary": 110000.00,
                "max_salary": 170000.00,
                "application_deadline": date.today() + timedelta(days=28),
                "required_skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Jenkins", "Linux", "Bash Scripting"]
            }
        ]
    },
    {
        "email": "mobileapps777@gmail.com",
        "company_name": "MobileApps Pro",
        "first_name": "Jessica",
        "last_name": "Brown",
        "phone": "+1-555-2004",
        "location": "Austin, TX",
        "address": "400 Mobile Drive, Austin, TX 78701",
        "jobs": [
            {
                "title": "Mobile App Developer",
                "description": "We're looking for a mobile developer to build cross-platform applications. You'll work with React Native or Flutter to create high-quality mobile apps for iOS and Android. Strong JavaScript skills and mobile development experience required.",
                "location": "Austin, TX",
                "employment_type": "full-time",
                "min_salary": 95000.00,
                "max_salary": 145000.00,
                "application_deadline": date.today() + timedelta(days=22),
                "required_skills": ["React Native", "Flutter", "JavaScript", "iOS Development", "Android Development"]
            }
        ]
    },
    {
        "email": "designstudio88@gmail.com",
        "company_name": "DesignStudio Creative",
        "first_name": "Kevin",
        "last_name": "Wong",
        "phone": "+1-555-2005",
        "location": "Los Angeles, CA",
        "address": "500 Design Boulevard, Los Angeles, CA 90028",
        "jobs": [
            {
                "title": "UI/UX Designer",
                "description": "Join our creative team as a UI/UX designer. You'll create user-centered designs, build prototypes, and work closely with developers to bring designs to life. Strong portfolio and experience with Figma, Adobe XD required.",
                "location": "Los Angeles, CA",
                "employment_type": "full-time",
                "min_salary": 80000.00,
                "max_salary": 120000.00,
                "application_deadline": date.today() + timedelta(days=20),
                "required_skills": ["UI/UX Design", "Figma", "Adobe XD", "Wireframing", "Prototyping"]
            }
        ]
    },
    {
        "email": "backendtech333@gmail.com",
        "company_name": "BackendTech Solutions",
        "first_name": "Amanda",
        "last_name": "Davis",
        "phone": "+1-555-2006",
        "location": "Boston, MA",
        "address": "600 Backend Street, Boston, MA 02116",
        "jobs": [
            {
                "title": "Backend Developer",
                "description": "We need a backend developer to build robust APIs and microservices. You'll work with Java, Spring Boot, and cloud technologies to create scalable backend systems. Experience with REST APIs and databases required.",
                "location": "Boston, MA",
                "employment_type": "full-time",
                "min_salary": 115000.00,
                "max_salary": 175000.00,
                "application_deadline": date.today() + timedelta(days=32),
                "required_skills": ["Java", "Spring Boot", "Python", "REST API", "PostgreSQL", "MySQL", "Microservices"]
            },
            {
                "title": "Java Developer",
                "description": "Join our Java development team. You'll work on enterprise applications using Java, Spring Framework, and Hibernate. Strong Java skills and experience with enterprise software development required.",
                "location": "Boston, MA",
                "employment_type": "full-time",
                "min_salary": 100000.00,
                "max_salary": 160000.00,
                "application_deadline": date.today() + timedelta(days=30),
                "required_skills": ["Java", "Spring Boot", "Spring Framework", "Hibernate", "MySQL", "PostgreSQL"]
            }
        ]
    },
    {
        "email": "fullstackdev2024@gmail.com",
        "company_name": "FullStackDev Inc",
        "first_name": "Marcus",
        "last_name": "Anderson",
        "phone": "+1-555-2007",
        "location": "Chicago, IL",
        "address": "700 Stack Avenue, Chicago, IL 60601",
        "jobs": [
            {
                "title": "Full Stack Engineer",
                "description": "We're seeking a full stack engineer to work on end-to-end web applications. You'll handle both frontend and backend development, work with modern frameworks, and collaborate with product teams. Experience with Python, JavaScript, React, and databases required.",
                "location": "Chicago, IL",
                "employment_type": "full-time",
                "min_salary": 125000.00,
                "max_salary": 185000.00,
                "application_deadline": date.today() + timedelta(days=27),
                "required_skills": ["Python", "JavaScript", "React", "Node.js", "PostgreSQL", "MongoDB", "Docker"]
            }
        ]
    },
    {
        "email": "pythondev2021@gmail.com",
        "company_name": "PythonDev Labs",
        "first_name": "Sofia",
        "last_name": "Garcia",
        "phone": "+1-555-2008",
        "location": "Miami, FL",
        "address": "800 Python Way, Miami, FL 33139",
        "jobs": [
            {
                "title": "Python Developer",
                "description": "Join our Python development team. You'll build scalable backend systems using Django, Flask, or FastAPI. Strong Python skills, experience with databases, and API development required.",
                "location": "Miami, FL",
                "employment_type": "full-time",
                "min_salary": 105000.00,
                "max_salary": 165000.00,
                "application_deadline": date.today() + timedelta(days=26),
                "required_skills": ["Python", "Django", "Flask", "FastAPI", "PostgreSQL", "MongoDB", "REST API"]
            }
        ]
    }
]


def get_skill_id(cursor, skill_name: str) -> int:
    """Get skill ID by name, return None if not found."""
    cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
    skill = cursor.fetchone()
    return skill['id'] if skill else None


def seed_recruiters_companies():
    """Seed recruiters, companies, job postings, and applications."""
    conn = MySQLConnection.get_connection()
    cursor = conn.cursor(dictionary=True)
    
    added_recruiters = 0
    added_jobs = 0
    added_applications = 0
    skipped_recruiters = 0
    
    print("Seeding recruiters, companies, and job postings...")
    print("=" * 60)
    
    try:
        # Get all job seekers for applications
        cursor.execute("SELECT id FROM users WHERE role = 'jobseeker'")
        job_seekers = cursor.fetchall()
        jobseeker_ids = [js['id'] for js in job_seekers]
        
        if not jobseeker_ids:
            print("[WARNING] No job seekers found. Create job seekers first.")
            return
        
        for company_data in COMPANIES:
            try:
                # Check if recruiter already exists
                cursor.execute("SELECT id FROM users WHERE email = %s", (company_data["email"],))
                existing_user = cursor.fetchone()
                
                if existing_user:
                    print(f"[SKIP] Recruiter already exists: {company_data['email']}")
                    recruiter_id = existing_user['id']
                    skipped_recruiters += 1
                else:
                    # Hash password
                    password_hash = get_password_hash(PASSWORD)
                    
                    # Create recruiter user
                    cursor.execute(
                        """
                        INSERT INTO users (email, password_hash, role, company_name)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (company_data["email"], password_hash, "recruiter", company_data["company_name"])
                    )
                    recruiter_id = cursor.lastrowid
                    
                    # Create profile
                    cursor.execute(
                        """
                        INSERT INTO user_profiles (user_id, first_name, last_name, phone, location, address)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (
                            recruiter_id,
                            company_data["first_name"],
                            company_data["last_name"],
                            company_data["phone"],
                            company_data["location"],
                            company_data["address"]
                        )
                    )
                    
                    conn.commit()
                    added_recruiters += 1
                    print(f"[OK] Added recruiter: {company_data['first_name']} {company_data['last_name']} ({company_data['email']})")
                    print(f"     Company: {company_data['company_name']}")
                
                # Create job postings for this company
                for job_data in company_data["jobs"]:
                    try:
                        # Get skill IDs for required skills
                        skill_ids = []
                        for skill_name in job_data["required_skills"]:
                            skill_id = get_skill_id(cursor, skill_name)
                            if skill_id:
                                skill_ids.append(skill_id)
                            else:
                                print(f"     Warning: Skill '{skill_name}' not found in database")
                        
                        # Create job posting
                        cursor.execute(
                            """
                            INSERT INTO job_postings 
                            (recruiter_id, title, company, description, location, employment_type, 
                             min_salary, max_salary, application_deadline, status)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                recruiter_id,
                                job_data["title"],
                                company_data["company_name"],
                                job_data["description"],
                                job_data["location"],
                                job_data["employment_type"],
                                job_data["min_salary"],
                                job_data["max_salary"],
                                job_data["application_deadline"],
                                "active"
                            )
                        )
                        job_id = cursor.lastrowid
                        
                        # Add required skills
                        for skill_id in skill_ids:
                            cursor.execute(
                                "INSERT INTO job_skills (job_id, skill_id, required) VALUES (%s, %s, TRUE)",
                                (job_id, skill_id)
                            )
                        
                        conn.commit()
                        added_jobs += 1
                        print(f"     - Created job: {job_data['title']} (ID: {job_id})")
                        
                        # Create applications from job seekers
                        # Apply 2-4 random job seekers to each job
                        import random
                        num_applications = random.randint(2, min(4, len(jobseeker_ids)))
                        selected_jobseekers = random.sample(jobseeker_ids, num_applications)
                        
                        for jobseeker_id in selected_jobseekers:
                            try:
                                # Create application
                                cursor.execute(
                                    """
                                    INSERT INTO applications (jobseeker_id, job_id, status, cover_letter)
                                    VALUES (%s, %s, %s, %s)
                                    """,
                                    (
                                        jobseeker_id,
                                        job_id,
                                        random.choice(["pending", "pending", "pending", "reviewed"]),  # Most pending, some reviewed
                                        f"I am interested in the {job_data['title']} position at {company_data['company_name']}. I believe my skills and experience make me a great fit for this role."
                                    )
                                )
                                added_applications += 1
                            except Exception as e:
                                # Skip if already applied (duplicate key)
                                pass
                        
                        conn.commit()
                        print(f"     - Added {num_applications} applications for this job")
                        
                    except Exception as e:
                        conn.rollback()
                        print(f"     [ERROR] Failed to create job '{job_data['title']}': {e}")
                        continue
                
                print()
                
            except Exception as e:
                conn.rollback()
                print(f"[ERROR] Failed to add company {company_data['company_name']}: {e}")
                continue
        
        print("=" * 60)
        print("Seeding complete!")
        print(f"Added: {added_recruiters} recruiters")
        print(f"Skipped: {skipped_recruiters} recruiters (already existed)")
        print(f"Added: {added_jobs} job postings")
        print(f"Added: {added_applications} applications")
        print(f"\nAll recruiters have password: {PASSWORD}")
        
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Fatal error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("RECRUITER & COMPANY SEEDING SCRIPT")
    print("=" * 60)
    print(f"Will add {len(COMPANIES)} companies with recruiters and job postings.")
    print("=" * 60)
    
    try:
        seed_recruiters_companies()
        print("\n[SUCCESS] Recruiters, companies, and job postings have been seeded successfully!")
        print("You can now log in with any recruiter email and password '12345678'")
    except Exception as e:
        print(f"\n[ERROR] Error: {e}")
        print("Make sure the database is running and job seekers are already created.")

