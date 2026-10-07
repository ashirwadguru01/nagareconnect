# Nagar e-Connect Frontend (HTML / CSS / JS)

Modern, clean, and responsive frontend for **Nagar e-Connect** built with vanilla HTML5, CSS3, and JavaScript.

## 🚀 How to Run

### Option 1: Full-Stack via Backend Server (Recommended)
The backend Express server serves both the REST API and the frontend static files on port `5000`:
```bash
cd backend
npm install
npm start
```
Then open: **[http://localhost:5000](http://localhost:5000)** in your browser!

### Option 2: Live Server or any Static Web Server
You can open `frontend/index.html` using:
- **VS Code Live Server extension** (usually on `http://localhost:5500`)
- **Node `serve` / `http-server`**: `npx serve frontend`
- **Python**: `python -m http.server 3000` (from inside `frontend`)

The frontend automatically detects whether it is served by the backend or an external static server and routes all `/api` requests seamlessly to `http://localhost:5000/api`.

---

## 📁 Directory Structure

```
frontend/
├── index.html                   # Landing page
├── login.html                   # Sign In page (with demo credentials)
├── register.html                # Registration page (Citizen / Worker)
│
├── citizen/                     # Citizen Portal
│   ├── dashboard.html           # Citizen dashboard, stats, reward balance, recent activity
│   ├── new-complaint.html       # Report issue with photo drag-and-drop & auto GPS
│   ├── complaints.html          # My complaints with search & status filters
│   ├── complaint-detail.html    # Full complaint details, photo, timeline & progress
│   ├── rewards.html             # Marketplace with catalog & transaction history
│   └── map.html                 # Interactive dark map view with status markers
│
├── worker/                      # Worker Portal
│   ├── dashboard.html           # Worker dashboard with monthly 100-resolution bonus bar
│   ├── tasks.html               # Assigned tasks with GPS navigation & status update modal
│   └── map.html                 # Navigation map with complaint markers
│
├── admin/                       # Admin Portal
│   ├── dashboard.html           # Analytics, SVG resolution donut, monthly bar chart
│   ├── complaints.html          # All complaints with worker assignment modal & pagination
│   ├── users.html               # Citizen/Worker/Admin management, role change & toggle
│   ├── workers.html             # Worker performance metrics & bonus eligibility
│   └── map.html                 # City-wide complaints map
│
├── css/
│   └── style.css                # Complete unified design system, dark mode & animations
│
└── js/
    ├── api.js                   # Centralized API client & toast notification system
    ├── auth.js                  # Authentication guards & session management
    ├── sidebar.js               # Dynamic responsive sidebar with mobile toggle
    ├── landing.js               # Landing page dynamic links
    ├── login.js                 # Login form & auth handling
    ├── register.js              # Signup validation & role selection
    ├── citizen-dashboard.js     # Citizen stats & activity loader
    ├── new-complaint.js         # Geolocation + Nominatim + photo upload
    ├── my-complaints.js         # Search & filter citizen complaints
    ├── complaint-detail.js      # Complaint timeline & progress tracker
    ├── rewards.js               # Points balance & reward redemption
    ├── map-view.js              # Dark Leaflet map with colored pins & popups
    ├── worker-dashboard.js      # Worker metrics & monthly progress
    ├── worker-tasks.js          # Resolve modal with notes & Google Maps directions
    ├── admin-dashboard.js       # Admin charts & statistics
    ├── admin-complaints.js      # Filter & worker assignment logic
    ├── admin-users.js           # Role switching & user activation
    └── admin-workers.js         # Monthly worker performance bars
```

---

## 🔑 Demo Credentials
- **Admin**: `admin@nagareconnect.in` / `Admin@123`
- Or register a new account as a **Citizen** or **Municipal Worker** directly on `/register.html`.
