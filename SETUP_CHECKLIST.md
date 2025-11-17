# ✅ React Frontend Setup Checklist

## Before You Start

- [ ] Node.js is installed (check: `node --version`)
- [ ] npm is installed (check: `npm --version`)
- [ ] Python backend dependencies are installed
- [ ] MySQL server is running
- [ ] Backend `.env` file is configured

---

## Installation Steps

### Step 1: Install Frontend Dependencies

Choose ONE option:

**Option A: Use Batch Script (Recommended)**
- [ ] Double-click `install-frontend.bat`
- [ ] Wait for "Installation Complete! ✓" message
- [ ] Press any key to close

**Option B: Manual Installation**
- [ ] Open terminal/PowerShell
- [ ] Run: `cd c:\cruz\frontend`
- [ ] Run: `npm install`
- [ ] Wait for completion (2-3 minutes)

---

### Step 2: Verify Installation

- [ ] Check that `frontend/node_modules` folder was created
- [ ] Check that no error messages appeared
- [ ] If errors occurred, read error message and fix issues

---

### Step 3: Start Backend Server

- [ ] Open terminal/PowerShell
- [ ] Run: `cd c:\cruz`
- [ ] Run: `python run.py`
- [ ] Wait for "Application startup complete" message
- [ ] Verify it's running at: http://127.0.0.1:8000
- [ ] Test API docs at: http://127.0.0.1:8000/api/docs
- [ ] Leave this terminal open (backend running)

---

### Step 4: Start Frontend Server

Choose ONE option:

**Option A: Use Batch Script**
- [ ] Double-click `start-servers.bat`
- [ ] Two windows will open (backend + frontend)
- [ ] Wait for both to start

**Option B: Manual Start**
- [ ] Open a NEW terminal/PowerShell (keep backend running)
- [ ] Run: `cd c:\cruz\frontend`
- [ ] Run: `npm run dev`
- [ ] Wait for "Local: http://localhost:5173" message
- [ ] Leave this terminal open (frontend running)

---

### Step 5: Access the Application

- [ ] Open your browser (Chrome, Edge, or Firefox recommended)
- [ ] Go to: http://localhost:5173
- [ ] You should see the modern landing page with gradient background
- [ ] If you see an error, check both terminals for error messages

---

## First Login Test

### Test Job Seeker Account

- [ ] Click "Login" or "Sign In" button
- [ ] Enter email: `anukul450@gmail.com`
- [ ] Enter password: `12345678`
- [ ] Click "Sign In"
- [ ] You should be redirected to Job Seeker Dashboard
- [ ] Verify you see statistics cards (Applications, Saved Jobs, etc.)
- [ ] Click through sidebar menu items
- [ ] Click user avatar (top right) → Logout

### Test Recruiter Account

- [ ] Click "Login" or "Sign In" button
- [ ] Enter email: `techcorp2024@gmail.com`
- [ ] Enter password: `12345678`
- [ ] Click "Sign In"
- [ ] You should be redirected to Recruiter Dashboard
- [ ] Verify you see recruiter interface
- [ ] Test navigation
- [ ] Logout

### Test Admin Account

- [ ] Click "Login"
- [ ] Enter email: `admin@gmail.com`
- [ ] Enter password: `12345678`
- [ ] Click "Sign In"
- [ ] You should be redirected to Admin Dashboard
- [ ] Verify you see admin interface
- [ ] Logout

---

## Troubleshooting Checklist

### If Page Doesn't Load

- [ ] Check if backend is running (terminal should show no errors)
- [ ] Check if frontend is running (terminal should show "Local: http://localhost:5173")
- [ ] Try accessing http://127.0.0.1:5173 instead
- [ ] Clear browser cache (Ctrl + Shift + R or Ctrl + F5)
- [ ] Check browser console (F12) for errors

### If Login Fails

- [ ] Verify backend is running on port 8000
- [ ] Check browser console (F12) → Network tab → look for failed requests
- [ ] Verify CORS is updated in `backend/main.py`
- [ ] Check that test account exists in database

### If "CORS Error" Appears

- [ ] Restart backend server (Ctrl+C, then `python run.py`)
- [ ] Verify `backend/main.py` includes:
  ```python
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ```
- [ ] Clear browser cache and reload

### If "Cannot Find Module" Error

- [ ] Run `npm install` again in frontend folder
- [ ] Delete `frontend/node_modules` folder
- [ ] Delete `frontend/package-lock.json`
- [ ] Run `npm install` again

### If Port 5173 is Already in Use

- [ ] Vite will automatically use next port (5174, 5175, etc.)
- [ ] Check terminal message for actual port
- [ ] Use that port in your browser

---

## Feature Testing Checklist

### Authentication
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials (shows error)
- [ ] Registration form validates inputs
- [ ] Registration creates new account
- [ ] Logout works correctly
- [ ] Protected routes redirect to login when not authenticated

### Job Seeker Dashboard
- [ ] Dashboard loads and shows statistics
- [ ] Sidebar navigation works
- [ ] User avatar dropdown works
- [ ] Responsive design (resize browser window)
- [ ] Mobile view works (hamburger menu)

### Recruiter Dashboard
- [ ] Dashboard loads correctly
- [ ] Navigation works
- [ ] User menu functions

### Admin Dashboard
- [ ] Dashboard loads correctly
- [ ] Navigation works
- [ ] User menu functions

### UI/UX
- [ ] Animations are smooth
- [ ] Buttons respond to hover
- [ ] Cards have hover effects
- [ ] Toast notifications appear for actions
- [ ] Forms validate inputs
- [ ] Loading indicators show during API calls

---

## Production Readiness Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Update JWT secret key in `.env`
- [ ] Remove or restrict CORS wildcard (`"*"`)
- [ ] Build frontend for production (`npm run build`)
- [ ] Set DEBUG=False in backend
- [ ] Configure proper database connection pooling
- [ ] Set up HTTPS/SSL
- [ ] Configure environment variables for production
- [ ] Test all features in production environment
- [ ] Set up monitoring and logging

---

## Support & Resources

### If You Need Help

1. **Check Documentation:**
   - Read `GETTING_STARTED_REACT.md`
   - Read `frontend/README.md`
   - Read `REACT_FRONTEND_SUMMARY.md`

2. **Check Console:**
   - Browser Console (F12) for frontend errors
   - Terminal for backend errors

3. **Common Solutions:**
   - Restart both servers
   - Clear browser cache
   - Delete `node_modules` and reinstall
   - Check that all files were created correctly

### File Locations

- Frontend code: `c:\cruz\frontend\src\`
- API service: `c:\cruz\frontend\src\services\api.js`
- Backend CORS: `c:\cruz\backend\main.py`
- Environment: `c:\cruz\.env`

---

## Success Indicators

You'll know everything is working when:

✅ Backend shows "Application startup complete"
✅ Frontend shows "Local: http://localhost:5173"
✅ Browser loads beautiful landing page
✅ Login redirects to correct dashboard
✅ No errors in browser console
✅ No errors in terminal windows
✅ API calls complete successfully
✅ Animations are smooth
✅ Navigation works
✅ Logout returns to landing page

---

## Next Steps After Setup

1. **Explore the Interface:**
   - Try all navigation items
   - Test different accounts (jobseeker, recruiter, admin)
   - Resize browser to test responsive design

2. **Customize (Optional):**
   - Change colors in `frontend/src/App.jsx`
   - Modify components in `frontend/src/pages/`
   - Add new features

3. **Deploy (When Ready):**
   - Build frontend: `npm run build`
   - Deploy to hosting service
   - Configure production environment

---

**Congratulations!** 🎉

If you've checked all the boxes above, you now have a fully functional, modern React frontend running with your FastAPI backend!

Enjoy your beautiful new interface! 🚀✨

---

Created with ❤️ for the Hybrid Job Application System
