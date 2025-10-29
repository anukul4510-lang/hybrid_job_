# Quick Reference - Hybrid Job System Upgrade

## 🚀 Start the System

```bash
# 1. Start backend
python run.py

# 2. Open frontend
# http://127.0.0.1:5500
```

---

## 🔑 Login Credentials

**Admin Account (Auto-created):**
```
Email: admin@gmail.com
Password: 12345678
```

**Test Accounts:** Create your own via registration

---

## 📝 New Registration Fields

When registering, you can now provide:
- ✅ Email (required)
- ✅ Password (required)
- ✅ Role (required)
- ✅ First Name
- ✅ Last Name
- ✅ Phone
- ✅ Location

All optional fields auto-populate your profile!

---

## 🎯 Key Features Quick Access

### For Job Seekers

**Skills Management (Enhanced):**
```
1. Go to "My Skills"
2. Type skill name in search box (e.g., "python")
3. See real-time recommendations
4. Click "Add" or select from popular skills
5. No dropdown limitation!
```

**Resume Management (API Ready):**
```javascript
// In browser console:
await apiClient.createResume("My Resume", "Content here");
await apiClient.getResumes();
```

**Application Filtering (API Ready):**
```javascript
// Filter by status
await apiClient.searchApplications("pending", null);
// Filter by company
await apiClient.searchApplications(null, "Google");
```

### For Recruiters

**Advanced Candidate Search (API Ready):**
```javascript
// Natural language search
await apiClient.searchCandidates("python developer in NYC");

// View candidate profile
await apiClient.getCandidateProfile(userId);
```

**Example Queries:**
- "Senior Python developer with 5+ years"
- "Frontend engineer React Next.js remote"
- "Data scientist machine learning San Francisco"

### For Admins

**Quick Actions:**
```
1. Login: admin@gmail.com / 12345678
2. View Stats: Automatic on login
3. Manage Users: Click user → Update role or Disable
4. View Logs: See all admin actions
5. Delete Jobs: Admin override on any job
```

---

## 🔧 API Endpoints Cheat Sheet

### Skills
```
GET  /api/jobseeker/skills/recommendations?query=python
POST /api/jobseeker/skills/create?skill_name=NewSkill
```

### Resumes
```
POST   /api/jobseeker/resumes?title=MyResume&content=...
GET    /api/jobseeker/resumes
PUT    /api/jobseeker/resumes/{id}
DELETE /api/jobseeker/resumes/{id}
PUT    /api/jobseeker/resumes/{id}/primary
```

### Applications
```
GET /api/jobseeker/applications/search?status=pending&company=Google
```

### Recruiter
```
GET /api/recruiter/users/search?query=python+developer
GET /api/recruiter/users/{userId}
```

### Admin
```
GET    /api/admin/users
GET    /api/admin/stats
PUT    /api/admin/users/{id}/role
PUT    /api/admin/users/{id}/status?action=disable
DELETE /api/admin/users/{id}
GET    /api/admin/logs
GET    /api/admin/jobs
DELETE /api/admin/jobs/{id}
```

---

## 🧪 Quick Tests

### Test Registration
```
1. Go to index.html
2. Click "Register"
3. Fill ALL fields (now includes name, phone, location)
4. Submit → Profile auto-created
5. Login → See pre-populated profile
```

### Test Skills
```
1. Login as job seeker
2. Go to "My Skills"
3. Type "java" → See recommendations
4. Click any skill or type custom → Added
```

### Test Resume (Console)
```javascript
// Create
const r = await apiClient.createResume("Software Engineer", "My experience...");
// List
const all = await apiClient.getResumes();
// Set primary
await apiClient.setPrimaryResume(all[0].id);
```

### Test Candidate Search (Console)
```javascript
const results = await apiClient.searchCandidates(
  "python developer", 
  "New York", 
  5
);
console.log(results.filters_applied); // AI parsed filters
console.log(results.results); // Matching candidates
```

### Test Admin
```
1. Login: admin@gmail.com / 12345678
2. Console: await apiClient.getStats()
3. Should see user counts, job counts, etc.
```

---

## 💡 Pro Tips

**Skills:**
- Type partial names: "py" finds "python"
- Popular skills show user counts
- Custom skills are saved for everyone

**Search:**
- Use natural language: "remote python jobs"
- System understands location, skills, experience
- Results ranked by relevance

**Admin:**
- All actions are logged (audit trail)
- Disable rather than delete (safer)
- Activity logs show who did what

---

## 🐛 Common Issues

**Q: Can't login as admin?**
```
A: Server creates admin on startup. Check console:
   "Default admin account created: admin@gmail.com / 12345678"
```

**Q: Skills recommendations not appearing?**
```
A: Check .env file has GEMINI_API_KEY
   Fallback: System shows popular skills instead
```

**Q: Registration fails?**
```
A: Optional fields can be left empty
   Only email, password, role are required
```

**Q: How to test resume features?**
```
A: Use API client in console (UI integration optional)
   await apiClient.createResume("Title", "Content")
```

---

## 📋 Feature Checklist

✅ **Working Now:**
- Enhanced registration
- Dynamic skills with recommendations
- Job search (already working)
- Resume CRUD (backend + API)
- Application filtering (backend + API)
- Candidate search (backend + API)
- Admin panel (backend + partial UI)
- Default admin account

🔶 **Needs UI Integration:**
- Resume management interface
- Candidate search interface
- Application filter buttons
- Admin action buttons

---

## 🎯 Most Important Changes

1. **Registration** → Now captures profile info
2. **Skills** → Type anything, get recommendations
3. **Admin Account** → admin@gmail.com / 12345678 created automatically
4. **APIs** → All endpoints ready for frontend integration

---

## 📞 Quick Help

**Start Here:** UPGRADE_COMPLETE.md
**Detailed Docs:** UPGRADE_FEATURES.md
**Setup Issues:** TROUBLESHOOTING.md
**Architecture:** ARCHITECTURE.md

---

**That's it! Your system is upgraded and ready to use! 🚀**

