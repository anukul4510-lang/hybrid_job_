# DFD Level 1 Prompt for Hybrid Job Application System

## Prompt for Creating Data Flow Diagram Level 1

Create a Data Flow Diagram (DFD) Level 1 for a **Hybrid Job Application System** that shows the main processes and data flows between external entities and the system.

### External Entities:
1. **Job Seeker** - Users looking for jobs
2. **Recruiter** - Users posting jobs and managing applications
3. **Admin** - System administrators managing users and system settings

### Main Processes (Processes 1.0 - 9.0):

#### **1.0 User Authentication & Registration**
- **Input:** Registration data (email, password, role, phone, profile info)
- **Output:** User account, JWT token, authentication status
- **External Entity:** Job Seeker, Recruiter
- **Data Stores:** Users Database

#### **2.0 Profile Management**
- **Input:** Profile data (first name, last name, location, job preference, bio, years of experience)
- **Output:** Updated profile, profile information
- **External Entity:** Job Seeker, Recruiter
- **Data Stores:** User Profiles Database

#### **3.0 Skills Management**
- **Input:** Skill data (skill name, proficiency level), skill ID for removal
- **Output:** User skills list, skill recommendations, skill addition confirmation
- **External Entity:** Job Seeker
- **Data Stores:** Skills Database, User Skills Database

#### **4.0 Resume Management**
- **Input:** Resume data (title, content, file URL), resume updates
- **Output:** Resume list, resume details, upload confirmation
- **External Entity:** Job Seeker
- **Data Stores:** Resumes Database

#### **5.0 Job Search & Browsing**
- **Input:** Search query (natural language), filters (location, employment type, salary range)
- **Output:** Job listings, search results with similarity scores
- **External Entity:** Job Seeker
- **Data Stores:** Job Postings Database, Vector Database (ChromaDB)

#### **6.0 Job Suggestions/Recommendations**
- **Input:** User profile data, user skills
- **Output:** Recommended jobs with match scores
- **External Entity:** Job Seeker
- **Data Stores:** User Profiles Database, Skills Database, Job Postings Database, Applications Database

#### **7.0 Application Management (Job Seeker)**
- **Input:** Application data (job ID, resume ID, cover letter)
- **Output:** Application confirmation, application status, saved jobs
- **External Entity:** Job Seeker
- **Data Stores:** Applications Database, Saved Jobs Database

#### **8.0 Job Posting Management (Recruiter)**
- **Input:** Job posting data (title, description, company, location, requirements, salary, employment type, required skills)
- **Output:** Job posting confirmation, job listings, job details
- **External Entity:** Recruiter
- **Data Stores:** Job Postings Database, Job Skills Database, Vector Database (ChromaDB)

#### **9.0 Application Management (Recruiter)**
- **Input:** Application ID, status updates (pending, accepted, rejected)
- **Output:** Application list for job, application details, status update confirmation
- **External Entity:** Recruiter
- **Data Stores:** Applications Database, Job Postings Database

#### **10.0 System Administration**
- **Input:** Admin commands (user management, role changes, system settings)
- **Output:** User list, system statistics, management confirmations
- **External Entity:** Admin
- **Data Stores:** Users Database, System Settings Database

### Data Stores:
1. **Users Database** - Stores user accounts (email, password hash, role)
2. **User Profiles Database** - Stores profile information (name, location, job preference, bio)
3. **Skills Database** - Stores all available skills
4. **User Skills Database** - Stores user-skill relationships with proficiency levels
5. **Resumes Database** - Stores resume files and content
6. **Job Postings Database** - Stores job postings and details
7. **Job Skills Database** - Stores job-skill relationships (required skills for jobs)
8. **Applications Database** - Stores job applications (jobseeker, job, resume, status, date)
9. **Saved Jobs Database** - Stores jobs saved for later by job seekers
10. **Vector Database (ChromaDB)** - Stores embeddings for semantic search

### Key Data Flows:

**Job Seeker Flows:**
- Registration data → 1.0 → Users Database
- Login credentials → 1.0 → JWT token → Job Seeker
- Profile data → 2.0 → User Profiles Database
- Skill data → 3.0 → User Skills Database
- Resume data → 4.0 → Resumes Database
- Search query → 5.0 → Job Postings Database/Vector DB → Search results → Job Seeker
- Profile/Skills → 6.0 → Job Postings Database → Recommendations → Job Seeker
- Application data → 7.0 → Applications Database

**Recruiter Flows:**
- Registration data → 1.0 → Users Database
- Job posting data → 8.0 → Job Postings Database/Vector DB
- Application review requests → 9.0 → Applications Database → Application details → Recruiter
- Status updates → 9.0 → Applications Database

**Admin Flows:**
- Admin commands → 10.0 → Users Database/System Settings → Admin reports

### Additional Notes:
- Process 5.0 and 6.0 use **Vector Database (ChromaDB)** for AI-powered semantic search and recommendations
- Process 8.0 indexes new job postings into the Vector Database for semantic search
- All processes communicate with **MySQL Database** for structured data storage
- JWT tokens are used for authentication across all processes
- Process 6.0 filters out jobs that the user has already applied to

### Diagram Style:
- Use standard DFD symbols: circles for processes, rectangles for external entities, open rectangles for data stores, arrows for data flows
- Number processes 1.0 through 10.0
- Label all data flows clearly
- Show bidirectional flows where data is both read and written

---

## Alternative Simplified Prompt for AI Tools:

"Create a Level 1 Data Flow Diagram (DFD) for a Hybrid Job Application System with the following:

**External Entities:** Job Seeker, Recruiter, Admin

**Main Processes:**
1. User Authentication (registration and login)
2. Profile Management
3. Skills Management  
4. Resume Management
5. Job Search & Browsing (with AI semantic search)
6. Job Recommendations/Suggestions (AI-powered matching)
7. Application Management (for job seekers)
8. Job Posting Management (for recruiters)
9. Application Review (for recruiters)
10. System Administration

**Data Stores:** Users, User Profiles, Skills, User Skills, Resumes, Job Postings, Job Skills, Applications, Saved Jobs, Vector Database (ChromaDB for embeddings)

Show data flows between external entities and processes, and between processes and data stores. Include authentication tokens, user data, profile data, skills, resumes, job postings, search queries, recommendations, and application data."

