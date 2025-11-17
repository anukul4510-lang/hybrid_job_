# 🚀 Getting Started with the New React Frontend

## ✨ What's New

Your Hybrid Job Application System now has a **completely redesigned modern frontend** built with:

- ⚛️ **React 18** - Latest React with improved performance
- 🎨 **Material-UI (MUI)** - Beautiful, professional UI components
- 🎭 **Framer Motion** - Smooth, engaging animations
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 🎯 **Modern UX** - Intuitive navigation and user experience
- ⚡ **Vite** - Lightning-fast development server

## 📋 Prerequisites

Before you begin, make sure you have:

1. ✅ **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. ✅ **npm** (comes with Node.js)
3. ✅ **Python** and your backend running

## 🛠️ Installation Steps

### Step 1: Install Node.js (if not installed)

1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer
4. Verify installation by opening a terminal and running:
   ```
   node --version
   npm --version
   ```

### Step 2: Install Frontend Dependencies

**Option A: Use the Batch Script (Easiest)**

1. Double-click `install-frontend.bat` in the `c:\cruz` folder
2. Wait for installation to complete (may take 2-3 minutes)

**Option B: Manual Installation**

1. Open a terminal
2. Navigate to the frontend folder:
   ```
   cd c:\cruz\frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Step 3: Start the Servers

**Option A: Use the Start Script (Easiest)**

1. Double-click `start-servers.bat` in the `c:\cruz` folder
2. This will start both backend and frontend servers

**Option B: Manual Start**

1. **Start Backend** (in first terminal):
   ```
   cd c:\cruz
   python run.py
   ```

2. **Start Frontend** (in second terminal):
   ```
   cd c:\cruz\frontend
   npm run dev
   ```

### Step 4: Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/api/docs

## 🎯 First Login

Use these test accounts to explore:

### Job Seeker
- Email: `anukul450@gmail.com`
- Password: `12345678`

### Recruiter
- Email: `techcorp2024@gmail.com`
- Password: `12345678`

### Admin
- Email: `admin@gmail.com`
- Password: `12345678`

## 🎨 Features Overview

### Landing Page
- Modern hero section with gradient background
- Feature showcase
- Call-to-action buttons
- Responsive design

### Authentication
- Beautiful login/register forms
- Form validation
- Password visibility toggle
- Error handling with toast notifications

### Job Seeker Dashboard
- **Dashboard**: Overview with statistics
- **Browse Jobs**: Search and filter jobs (AI-powered)
- **My Applications**: Track application status
- **My Resumes**: Upload and manage resumes
- **My Skills**: Add and manage skills
- **Profile**: Update personal information

### Recruiter Dashboard
- **Dashboard**: Overview with metrics
- **My Jobs**: Create and manage job postings
- **Search Candidates**: AI-powered candidate search
- **Shortlist**: Manage shortlisted candidates
- **Applications**: Review and manage applications

### Admin Dashboard
- **Dashboard**: System overview
- **Users**: Manage all users
- **Jobs**: Manage all job postings
- **Statistics**: System analytics
- **Settings**: System configuration

## 🎨 Design Features

### Modern UI Elements
- ✨ Smooth animations and transitions
- 🎴 Card-based layouts
- 📊 Data visualization (where applicable)
- 🎨 Gradient backgrounds
- 🔔 Toast notifications
- 💅 Consistent styling throughout

### Responsive Design
- 📱 **Mobile** (< 600px): Hamburger menu, stacked layout
- 📱 **Tablet** (600-960px): Optimized spacing
- 💻 **Desktop** (> 960px): Full sidebar navigation

### Color Scheme
- **Primary**: Indigo (#6366f1)
- **Secondary**: Pink (#ec4899)
- **Success**: Green (#10b981)
- **Background**: Light gray (#f8fafc)

## 🔧 Customization

### Change Colors

Edit `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#YOUR_COLOR' },
    secondary: { main: '#YOUR_COLOR' },
  },
});
```

### Change API URL

Edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'YOUR_API_URL';
```

## 🐛 Troubleshooting

### Port Already in Use

If you see "Port 5173 is already in use", either:
1. Close the existing Vite server
2. Or Vite will automatically use the next available port

### CORS Errors

Make sure your backend has these CORS settings:

```python
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...
]
```

This has already been updated in your `backend/main.py`.

### Cannot Find Module

Run `npm install` again in the frontend folder.

### Backend Not Responding

1. Check if backend is running on port 8000
2. Verify `run.py` is executed successfully
3. Check terminal for any Python errors

## 📦 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React Context (Auth)
│   ├── pages/          # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── JobSeekerDashboard.jsx
│   │   ├── RecruiterDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── App.jsx          # Main app
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start servers: Use `start-servers.bat` or manually
3. ✅ Login with test account
4. ✅ Explore the modern interface
5. 🎉 Enjoy your new beautiful frontend!

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)

## 💡 Tips

- Use **Ctrl+Shift+I** to open browser DevTools
- Check the Console tab for any errors
- Network tab shows all API calls
- React DevTools extension is helpful for debugging

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Verify backend is running (http://127.0.0.1:8000)
3. Make sure all dependencies are installed
4. Try clearing browser cache (Ctrl+Shift+R)

---

**Congratulations!** 🎉 You now have a modern, professional frontend for your Hybrid Job Application System!
