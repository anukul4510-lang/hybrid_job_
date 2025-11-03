# Database Schema Documentation for DFD and ER Diagrams

## Overview
This document explains all database tables, their functionality, relationships, and data flow patterns for creating Data Flow Diagrams (DFD) and Entity Relationship (ER) diagrams.

---

## Table 1: `users`
**Purpose**: Core authentication and user identity table. Stores all users (job seekers, recruiters, admins).

### Attributes:
- `id` (INT, PK) - Unique user identifier
- `email` (VARCHAR(255), UNIQUE, NOT NULL) - User email (login credential)
- `password_hash` (VARCHAR(255), NOT NULL) - Bcrypt hashed password
- `role` (ENUM: 'jobseeker', 'recruiter', 'admin') - User role for authorization
- `company_name` (VARCHAR(255)) - Company name (for recruiters)
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Authentication**: Stores login credentials for all users
- **Authorization**: Role-based access control (RBAC)
- **User Identity**: Base entity for all system participants

### DFD Context:
- **Input**: User registration/login data
- **Output**: User authentication tokens, user information
- **Process**: Authentication, authorization, user management

### ER Context:
- **Entity Type**: Strong entity (independent)
- **Relationships**: 
  - One-to-One with `user_profiles`
  - One-to-Many with `applications` (as jobseeker_id)
  - One-to-Many with `job_postings` (as recruiter_id)
  - One-to-Many with `notifications`
  - One-to-Many with `resumes`
  - One-to-Many with `admin_logs` (as admin_id)
  - One-to-Many with `shortlisted_candidates` (as recruiter_id and candidate_id)
  - Many-to-Many with `skills` via `user_skills`

---

## Table 2: `user_profiles`
**Purpose**: Extended user information and profile details.

### Attributes:
- `id` (INT, PK) - Profile identifier
- `user_id` (INT, FK → users.id) - Reference to users table
- `first_name` (VARCHAR(100)) - User's first name
- `last_name` (VARCHAR(100)) - User's last name
- `phone` (VARCHAR(20)) - Contact phone number
- `location` (VARCHAR(255)) - City/State location
- `address` (TEXT) - Full address
- `job_of_choice` (VARCHAR(255)) - Preferred job role/title
- `bio` (TEXT) - Professional biography/description
- `profile_picture` (VARCHAR(500)) - Profile picture URL
- `resume_url` (VARCHAR(500)) - Resume file URL
- `linkedin_url` (VARCHAR(500)) - LinkedIn profile URL
- `portfolio_url` (VARCHAR(500)) - Portfolio website URL
- `years_experience` (INT) - Years of work experience
- `created_at` (TIMESTAMP) - Profile creation date
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Profile Management**: Stores extended user information
- **Job Matching**: Contains job preferences and experience data
- **Search Data**: Provides data for candidate search and matching

### DFD Context:
- **Input**: Profile creation/update data
- **Output**: User profile information for search and matching
- **Process**: Profile creation, update, retrieval

### ER Context:
- **Entity Type**: Weak entity (depends on users)
- **Relationships**: 
  - One-to-One with `users` (mandatory, ON DELETE CASCADE)

---

## Table 3: `skills`
**Purpose**: Master catalog of all available skills in the system.

### Attributes:
- `id` (INT, PK) - Skill identifier
- `name` (VARCHAR(100), UNIQUE, NOT NULL) - Skill name (e.g., "Python", "React")

### Functionality:
- **Skill Catalog**: Centralized skill database
- **Skill Matching**: Used for job-candidate matching
- **Skill Suggestions**: Provides skill recommendations

### DFD Context:
- **Input**: New skill creation
- **Output**: Available skills for selection
- **Process**: Skill management, skill lookup

### ER Context:
- **Entity Type**: Strong entity
- **Relationships**: 
  - Many-to-Many with `users` via `user_skills`
  - Many-to-Many with `job_postings` via `job_skills`

---

## Table 4: `user_skills`
**Purpose**: Junction table linking users to their skills (Many-to-Many relationship).

### Attributes:
- `user_id` (INT, FK → users.id, PK) - Reference to user
- `skill_id` (INT, FK → skills.id, PK) - Reference to skill
- `proficiency_level` (ENUM: 'beginner', 'intermediate', 'advanced', 'expert') - Skill proficiency

### Functionality:
- **Skill Association**: Links users with their skills
- **Proficiency Tracking**: Tracks skill level per user
- **Matching**: Used in job-candidate matching algorithms

### DFD Context:
- **Input**: User skill additions/updates
- **Output**: User skill lists for matching
- **Process**: Skill association, skill matching

### ER Context:
- **Entity Type**: Associative entity (junction table)
- **Relationships**: 
  - Many-to-Many between `users` and `skills`

---

## Table 5: `job_postings`
**Purpose**: Job postings created by recruiters.

### Attributes:
- `id` (INT, PK) - Job posting identifier
- `recruiter_id` (INT, FK → users.id) - Recruiter who posted the job
- `title` (VARCHAR(255), NOT NULL) - Job title
- `company` (VARCHAR(255), NOT NULL) - Company name
- `description` (TEXT, NOT NULL) - Job description
- `location` (VARCHAR(255)) - Job location
- `employment_type` (ENUM: 'full-time', 'part-time', 'contract', 'internship') - Employment type
- `min_salary` (DECIMAL(10,2)) - Minimum salary
- `max_salary` (DECIMAL(10,2)) - Maximum salary
- `posted_date` (TIMESTAMP) - Job posting date
- `application_deadline` (DATE) - Application deadline
- `status` (ENUM: 'active', 'closed', 'draft') - Job posting status
- `created_at` (TIMESTAMP) - Record creation date
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Job Management**: Create, update, delete job postings
- **Job Search**: Primary entity for job search functionality
- **Application Target**: Jobs receive applications from job seekers

### DFD Context:
- **Input**: Job posting creation/update data
- **Output**: Job listings for search and browsing
- **Process**: Job posting management, job search indexing

### ER Context:
- **Entity Type**: Strong entity
- **Relationships**: 
  - Many-to-One with `users` (as recruiter)
  - One-to-Many with `applications`
  - One-to-Many with `saved_jobs`
  - One-to-Many with `shortlisted_candidates`
  - Many-to-Many with `skills` via `job_skills`

---

## Table 6: `job_skills`
**Purpose**: Junction table linking job postings to required skills (Many-to-Many relationship).

### Attributes:
- `job_id` (INT, FK → job_postings.id, PK) - Reference to job posting
- `skill_id` (INT, FK → skills.id, PK) - Reference to skill
- `required` (BOOLEAN) - Whether skill is required (default: TRUE)

### Functionality:
- **Skill Requirements**: Defines required skills for each job
- **Job Matching**: Used to match candidates to jobs based on skills
- **Filtering**: Enables skill-based job filtering

### DFD Context:
- **Input**: Job skill requirements
- **Output**: Job skill lists for matching
- **Process**: Skill requirement management, skill-based filtering

### ER Context:
- **Entity Type**: Associative entity (junction table)
- **Relationships**: 
  - Many-to-Many between `job_postings` and `skills`

---

## Table 7: `applications`
**Purpose**: Job applications submitted by job seekers.

### Attributes:
- `id` (INT, PK) - Application identifier
- `jobseeker_id` (INT, FK → users.id) - Job seeker who applied
- `job_id` (INT, FK → job_postings.id) - Job posting applied to
- `resume_url` (VARCHAR(500)) - Resume file URL
- `cover_letter` (TEXT) - Cover letter text
- `status` (ENUM: 'pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') - Application status
- `applied_date` (TIMESTAMP) - Application submission date
- `reviewed_date` (TIMESTAMP) - Date when application was reviewed
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Application Management**: Tracks job applications
- **Status Tracking**: Manages application lifecycle (pending → reviewed → shortlisted/rejected/accepted)
- **Application History**: Provides application history for job seekers and recruiters

### DFD Context:
- **Input**: Application submission data
- **Output**: Application records and status updates
- **Process**: Application creation, status updates, application retrieval

### ER Context:
- **Entity Type**: Weak entity (depends on users and job_postings)
- **Relationships**: 
  - Many-to-One with `users` (as jobseeker)
  - Many-to-One with `job_postings`
  - **Constraint**: UNIQUE (jobseeker_id, job_id) - prevents duplicate applications

---

## Table 8: `saved_jobs`
**Purpose**: Jobs saved/bookmarked by job seekers for later viewing.

### Attributes:
- `id` (INT, PK) - Saved job identifier
- `jobseeker_id` (INT, FK → users.id) - Job seeker who saved the job
- `job_id` (INT, FK → job_postings.id) - Job posting that was saved
- `saved_date` (TIMESTAMP) - Date when job was saved

### Functionality:
- **Job Bookmarking**: Allows job seekers to save jobs
- **Job Queue**: Creates a personal job queue for job seekers
- **Quick Access**: Enables quick access to favorite jobs

### DFD Context:
- **Input**: Job save requests
- **Output**: Saved job lists
- **Process**: Job saving, saved job retrieval

### ER Context:
- **Entity Type**: Weak entity
- **Relationships**: 
  - Many-to-One with `users` (as jobseeker)
  - Many-to-One with `job_postings`
  - **Constraint**: UNIQUE (jobseeker_id, job_id) - prevents duplicate saves

---

## Table 9: `notifications`
**Purpose**: System notifications for users.

### Attributes:
- `id` (INT, PK) - Notification identifier
- `user_id` (INT, FK → users.id) - User receiving notification
- `title` (VARCHAR(255), NOT NULL) - Notification title
- `message` (TEXT, NOT NULL) - Notification message
- `type` (VARCHAR(50)) - Notification type (e.g., 'info', 'alert', 'success')
- `is_read` (BOOLEAN) - Read status (default: FALSE)
- `created_at` (TIMESTAMP) - Notification creation date

### Functionality:
- **Notification System**: Delivers messages to users
- **Status Updates**: Notifies users about application status, new jobs, etc.
- **Alert Management**: Tracks read/unread notifications

### DFD Context:
- **Input**: Notification creation requests
- **Output**: Notification lists for users
- **Process**: Notification creation, notification retrieval, mark as read

### ER Context:
- **Entity Type**: Weak entity
- **Relationships**: 
  - Many-to-One with `users`

---

## Table 10: `resumes`
**Purpose**: Resume documents uploaded by users (job seekers primarily).

### Attributes:
- `id` (INT, PK) - Resume identifier
- `user_id` (INT, FK → users.id) - User who owns the resume
- `title` (VARCHAR(255)) - Resume title/name
- `content` (TEXT) - Resume content/text
- `file_url` (VARCHAR(500)) - Resume file URL
- `is_primary` (BOOLEAN) - Whether this is the primary resume (default: FALSE)
- `created_at` (TIMESTAMP) - Resume creation date
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Resume Management**: Stores multiple resumes per user
- **Resume Storage**: Can store both text content and file URLs
- **Primary Resume**: Designates primary resume for applications

### DFD Context:
- **Input**: Resume upload/create requests
- **Output**: Resume data for applications
- **Process**: Resume creation, resume retrieval, primary resume selection

### ER Context:
- **Entity Type**: Weak entity
- **Relationships**: 
  - Many-to-One with `users`

---

## Table 11: `system_settings`
**Purpose**: System-wide configuration settings (for admin use).

### Attributes:
- `id` (INT, PK) - Setting identifier
- `setting_key` (VARCHAR(100), UNIQUE, NOT NULL) - Setting name/key
- `setting_value` (TEXT) - Setting value
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Configuration Management**: Stores system-wide settings
- **Admin Control**: Allows admins to configure system behavior
- **Dynamic Settings**: Enables runtime configuration changes

### DFD Context:
- **Input**: Setting updates from admin
- **Output**: System configuration values
- **Process**: Setting retrieval, setting updates

### ER Context:
- **Entity Type**: Strong entity (independent)

---

## Table 12: `admin_logs`
**Purpose**: Audit log of admin actions.

### Attributes:
- `id` (INT, PK) - Log entry identifier
- `admin_id` (INT, FK → users.id) - Admin who performed the action
- `action` (VARCHAR(255), NOT NULL) - Action performed (e.g., "DELETE_USER", "UPDATE_SETTING")
- `target_type` (VARCHAR(50)) - Type of target (e.g., "user", "job", "setting")
- `target_id` (INT) - ID of target entity
- `details` (TEXT) - Additional details about the action
- `created_at` (TIMESTAMP) - Action timestamp

### Functionality:
- **Audit Trail**: Tracks all admin actions
- **Security**: Provides accountability and security logging
- **Compliance**: Supports compliance and audit requirements

### DFD Context:
- **Input**: Admin action events
- **Output**: Audit log entries
- **Process**: Log creation, log retrieval for audits

### ER Context:
- **Entity Type**: Weak entity
- **Relationships**: 
  - Many-to-One with `users` (as admin)

---

## Table 13: `shortlisted_candidates`
**Purpose**: Candidates shortlisted by recruiters for specific jobs.

### Attributes:
- `id` (INT, PK) - Shortlist entry identifier
- `recruiter_id` (INT, FK → users.id) - Recruiter who shortlisted
- `candidate_id` (INT, FK → users.id) - Candidate who was shortlisted
- `job_id` (INT, FK → job_postings.id) - Associated job posting (nullable)
- `match_score` (DECIMAL(5,2)) - AI matching score (0-100)
- `notes` (TEXT) - Recruiter notes about candidate
- `status` (ENUM: 'shortlisted', 'contacted', 'interviewing', 'rejected', 'hired') - Candidate status
- `shortlisted_date` (TIMESTAMP) - Shortlist date
- `updated_at` (TIMESTAMP) - Last update timestamp

### Functionality:
- **Candidate Shortlisting**: Tracks shortlisted candidates
- **Status Management**: Manages candidate pipeline (shortlisted → contacted → interviewing → hired/rejected)
- **Matching Score**: Stores AI-calculated match scores

### DFD Context:
- **Input**: Shortlist creation/update requests
- **Output**: Shortlist entries for recruiters
- **Process**: Shortlist management, status updates

### ER Context:
- **Entity Type**: Weak entity
- **Relationships**: 
  - Many-to-One with `users` (as recruiter)
  - Many-to-One with `users` (as candidate)
  - Many-to-One with `job_postings` (ON DELETE SET NULL - optional relationship)
  - **Constraint**: UNIQUE (recruiter_id, candidate_id) - prevents duplicate shortlists

---

## Entity Relationship Diagram (ER) Summary

### Entity Types:
1. **Strong Entities** (independent):
   - `users`
   - `skills`
   - `system_settings`

2. **Weak Entities** (dependent):
   - `user_profiles` (depends on `users`)
   - `job_postings` (depends on `users` as recruiter)
   - `applications` (depends on `users` and `job_postings`)
   - `saved_jobs` (depends on `users` and `job_postings`)
   - `notifications` (depends on `users`)
   - `resumes` (depends on `users`)
   - `admin_logs` (depends on `users`)
   - `shortlisted_candidates` (depends on `users`)

3. **Associative/Junction Entities**:
   - `user_skills` (Many-to-Many between `users` and `skills`)
   - `job_skills` (Many-to-Many between `job_postings` and `skills`)

### Relationship Cardinalities:
- **One-to-One**: `users` ↔ `user_profiles`
- **One-to-Many**: 
  - `users` → `job_postings` (as recruiter)
  - `users` → `applications` (as jobseeker)
  - `users` → `notifications`
  - `users` → `resumes`
  - `users` → `admin_logs`
  - `users` → `shortlisted_candidates` (as recruiter and candidate)
  - `job_postings` → `applications`
  - `job_postings` → `saved_jobs`
  - `job_postings` → `shortlisted_candidates`
- **Many-to-Many**: 
  - `users` ↔ `skills` (via `user_skills`)
  - `job_postings` ↔ `skills` (via `job_skills`)

---

## Data Flow Diagram (DFD) Patterns

### Level 0 (Context Diagram):
```
External Entities:
- Job Seeker
- Recruiter
- Admin

System: Job Application Platform

Data Flows:
- Registration/Login Data
- Profile Data
- Job Posting Data
- Application Data
- Search Queries
- Notifications
```

### Level 1 (Process Decomposition):

**Process 1: User Management**
- Registration → `users` → `user_profiles`
- Login → `users` (authentication)
- Profile Update → `user_profiles`

**Process 2: Job Posting Management**
- Create Job → `job_postings` → `job_skills`
- Update Job → `job_postings`
- Delete Job → `job_postings` (CASCADE to related records)

**Process 3: Application Management**
- Submit Application → `applications`
- Update Status → `applications`
- Create Notification → `notifications`

**Process 4: Search & Matching**
- Search Jobs → Read `job_postings`, `job_skills`
- Search Candidates → Read `user_profiles`, `user_skills`
- Match Calculation → Compare `user_skills` with `job_skills`

**Process 5: Shortlisting**
- Shortlist Candidate → `shortlisted_candidates`
- Update Status → `shortlisted_candidates`
- Create Notification → `notifications`

**Process 6: Resume Management**
- Upload Resume → `resumes`
- Set Primary → `resumes` (update `is_primary`)

**Process 7: Notification System**
- Create Notification → `notifications`
- Mark Read → `notifications` (update `is_read`)

**Process 8: Admin Functions**
- System Settings → `system_settings`
- Audit Log → `admin_logs`
- User Management → `users`, `user_profiles`

---

## Key Functional Flows

### Flow 1: Job Application Flow
1. Job Seeker views jobs (`job_postings`)
2. Job Seeker applies (`applications` created)
3. Notification sent to Recruiter (`notifications`)
4. Recruiter reviews application (`applications.status` updated)
5. Notification sent to Job Seeker (`notifications`)
6. Optional: Candidate shortlisted (`shortlisted_candidates`)

### Flow 2: Job Posting Flow
1. Recruiter creates job (`job_postings`)
2. Skills added (`job_skills`)
3. Job indexed for search
4. Job appears in search results
5. Job Seekers can view, save (`saved_jobs`), or apply

### Flow 3: Candidate Search Flow
1. Recruiter searches candidates
2. Query matches against `user_profiles`, `user_skills`
3. Results ranked by match score
4. Recruiter shortlists (`shortlisted_candidates`)
5. Status tracked through pipeline

### Flow 4: Profile Management Flow
1. User creates profile (`user_profiles`)
2. User adds skills (`user_skills`)
3. Profile data used for matching and search
4. Profile updated as needed

---

## Database Constraints and Rules

### Foreign Key Constraints:
- All foreign keys use `ON DELETE CASCADE` except:
  - `shortlisted_candidates.job_id` uses `ON DELETE SET NULL`

### Unique Constraints:
- `users.email` - Unique email addresses
- `skills.name` - Unique skill names
- `applications(jobseeker_id, job_id)` - One application per job per user
- `saved_jobs(jobseeker_id, job_id)` - One save per job per user
- `shortlisted_candidates(recruiter_id, candidate_id)` - One shortlist per recruiter-candidate pair
- `system_settings.setting_key` - Unique setting keys

### Default Values:
- `users.role` = 'jobseeker'
- `user_skills.proficiency_level` = 'intermediate'
- `job_postings.employment_type` = 'full-time'
- `job_postings.status` = 'active'
- `applications.status` = 'pending'
- `shortlisted_candidates.status` = 'shortlisted'
- `notifications.is_read` = FALSE
- `resumes.is_primary` = FALSE

---

## Use Cases for Diagrams

### For ER Diagram:
- Show entity relationships and cardinalities
- Identify primary and foreign keys
- Visualize junction tables for many-to-many relationships
- Understand data dependencies (strong vs weak entities)

### For DFD:
- Map data flows between processes
- Identify system boundaries
- Show data stores (tables)
- Understand process dependencies
- Track data transformations

---

This schema supports a complete job application platform with user management, job posting, application tracking, search capabilities, and administrative functions.

