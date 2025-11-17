# 🚀 Quick Reference - React Frontend

## Installation (One Time)

```bash
# Option 1: Double-click
install-frontend.bat

# Option 2: Manual
cd frontend
npm install
```

## Start Servers

```bash
# Option 1: Double-click
start-servers.bat

# Option 2: Manual (2 terminals)
Terminal 1: python run.py
Terminal 2: cd frontend && npm run dev
```

## URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/api/docs

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | anukul450@gmail.com | 12345678 |
| Recruiter | techcorp2024@gmail.com | 12345678 |
| Admin | admin@gmail.com | 12345678 |

## Common Commands

```bash
# Install dependencies
cd frontend && npm install

# Start development server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

## File Locations

| What | Where |
|------|-------|
| Pages | `frontend/src/pages/` |
| Components | `frontend/src/components/` |
| API Service | `frontend/src/services/api.js` |
| Auth Context | `frontend/src/contexts/AuthContext.jsx` |
| Theme Config | `frontend/src/App.jsx` |
| Backend CORS | `backend/main.py` |

## Quick Customization

### Change Colors
Edit `frontend/src/App.jsx`:
```javascript
primary: { main: '#6366f1' },  // Your color here
secondary: { main: '#ec4899' }, // Your color here
```

### Change API URL
Edit `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'YOUR_API_URL';
```

### Change App Title
Edit `frontend/index.html`:
```html
<title>Your Title Here</title>
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | Vite will use next port (5174, 5175...) |
| CORS error | Restart backend, check `backend/main.py` |
| Module not found | Run `npm install` in frontend folder |
| Blank page | Check browser console (F12) |
| Login fails | Check backend is running on port 8000 |

## Browser DevTools

- **Open**: Press `F12` or `Ctrl+Shift+I`
- **Console**: See JavaScript errors
- **Network**: See API requests
- **Elements**: Inspect HTML/CSS

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Hard Refresh | `Ctrl+Shift+R` or `Ctrl+F5` |
| Open DevTools | `F12` or `Ctrl+Shift+I` |
| Clear Console | `Ctrl+L` (in DevTools) |

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── contexts/       # State management
│   ├── pages/         # Page components
│   ├── services/      # API integration
│   └── App.jsx        # Main app
├── index.html
├── package.json
└── vite.config.js
```

## Documentation Files

1. **GETTING_STARTED_REACT.md** - Complete setup guide
2. **REACT_FRONTEND_SUMMARY.md** - Full feature overview
3. **SETUP_CHECKLIST.md** - Step-by-step checklist
4. **frontend/README.md** - Frontend-specific docs
5. **QUICK_REFERENCE.md** - This file!

## Tech Stack

- React 18.2
- Vite 5.0
- Material-UI 5.14
- React Router 6.20
- Axios 1.6
- Framer Motion 10.16
- React Toastify 9.1

## Need More Help?

1. Check `GETTING_STARTED_REACT.md` for detailed guide
2. Check `SETUP_CHECKLIST.md` for troubleshooting
3. Open browser console (F12) for error details
4. Check both terminal windows for errors

---

**Quick Start Summary:**
1. Run `install-frontend.bat`
2. Run `start-servers.bat`
3. Open `http://localhost:5173`
4. Login with test account
5. Enjoy! 🎉
