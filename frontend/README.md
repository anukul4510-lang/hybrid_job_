# Hybrid Job System - Modern React Frontend

## 🎨 What's New

This is a **complete redesign** of the Hybrid Job Application System frontend using:

- ⚛️ **React 18** with Vite for blazing-fast development
- 🎨 **Material-UI (MUI)** for beautiful, modern components
- 🎭 **Framer Motion** for smooth animations
- 🎯 **React Router v6** for seamless navigation
- 🔐 **Context API** for state management
- 📱 **Fully Responsive** design for all devices
- 🌙 **Ready for Dark Mode** (theme system in place)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

### 3. Make Sure Backend is Running

In a separate terminal:

```bash
cd c:\cruz
python run.py
```

Backend should be running on **http://127.0.0.1:8000**

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── contexts/           # React Context (Auth, etc.)
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── JobSeekerDashboard.jsx
│   │   ├── RecruiterDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Features

### For Job Seekers
- ✅ Beautiful profile management
- ✅ Modern resume upload interface
- ✅ AI-powered job recommendations
- ✅ Advanced job search with filters
- ✅ Application tracking
- ✅ Skills management

### For Recruiters
- ✅ Job posting management
- ✅ Candidate search with AI
- ✅ Shortlist management
- ✅ Application review system
- ✅ Beautiful data tables

### For Admins
- ✅ System statistics dashboard
- ✅ User management
- ✅ Job management
- ✅ Analytics and insights

## 🔧 Configuration

The frontend is pre-configured to connect to your FastAPI backend at `http://127.0.0.1:8000/api`.

If you need to change the backend URL, edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

## 🎨 Customization

### Theme
Edit `src/App.jsx` to customize colors:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },  // Change primary color
    secondary: { main: '#ec4899' }, // Change secondary color
  },
});
```

### Components
All components use Material-UI which means:
- Consistent design system
- Pre-built accessible components
- Easy to customize with `sx` prop
- Responsive by default

## 📱 Responsive Design

The new design is fully responsive:
- 📱 Mobile (< 600px)
- 📱 Tablet (600px - 960px)
- 💻 Desktop (> 960px)

## 🔐 Authentication Flow

1. User logs in → Token stored in localStorage
2. Token automatically added to all API requests
3. On 401 response → Auto redirect to login
4. Protected routes check authentication before rendering

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is in use, Vite will automatically use the next available port.

### CORS Errors
Make sure your backend CORS settings allow `http://localhost:5173`:

```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Connection Issues
1. Verify backend is running on port 8000
2. Check browser console for error messages
3. Verify API_BASE_URL in `src/services/api.js`

## 📚 Technologies Used

- React 18.2
- Vite 5.0
- Material-UI 5.14
- React Router 6.20
- Axios 1.6
- Framer Motion 10.16
- React Toastify 9.1

## 🎉 Next Steps

1. Run `npm install` in the frontend directory
2. Start both backend and frontend servers
3. Open http://localhost:5173 in your browser
4. Enjoy your new modern interface!

## 💡 Test Accounts

- **Job Seeker**: anukul450@gmail.com / 12345678
- **Recruiter**: techcorp2024@gmail.com / 12345678
- **Admin**: admin@gmail.com / 12345678

---

Built with ❤️ using React and Material-UI
