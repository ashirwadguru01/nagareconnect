
# 🌿 Nagar e-Connect — Setup & Run Guide

## ✅ Current Status
- **Frontend**: Running at http://localhost:5173
- **Backend**: Running at http://localhost:5000
- **Database**: MySQL `nagareconnect` — all tables created

---

## 🔑 Demo Credentials

| Role    | Email                       | Password   |
|---------|-----------------------------|------------|
| Admin   | admin@nagareconnect.in      | Admin@123  |
| Citizen | Register at /register       | (your own) |
| Worker  | Register at /register (Worker) | (your own) |

---

## 🚀 Starting the App (next time)

### Terminal 1 — Backend
```powershell
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2 — Frontend
```powershell
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## 📋 Features by Role

### 🧑 Citizen
- Register/Login
- Report garbage issue (photo + GPS location)
- Track complaint status: Pending → In Progress → Resolved
- View all complaints on Google Maps
- Earn reward points (+5 on submit, +20 on resolve)
- Redeem points in Reward Marketplace

### 👷 Worker
- View assigned complaints
- One-click Google Maps navigation to complaint
- Mark complaint In Progress / Resolved
- Track monthly bonus progress (goal: 100/month)

### 🛡️ Admin
- Dashboard with stats, charts, resolution rate
- Manage all complaints + assign to workers
- User management (enable/disable, change roles)
- Worker performance tracking
- Bonus eligibility detection (>100 resolved/month)
- Map view of all complaints

---

## ⚙️ Environment Setup

### Backend `.env`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=NewPassword123
DB_NAME=nagareconnect
JWT_SECRET=nagareconnect_super_secret_jwt_key_2024
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🗺️ Google Maps Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps JavaScript API**
3. Create an API key
4. Set it in `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY`

## ☁️ Cloudinary Setup (Image Uploads)
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Get Cloud Name, API Key, API Secret from dashboard
3. Set them in `backend/.env`

---

## 📁 Project Structure
```
nagareconnect/
├── backend/
│   ├── server.js              # Express entry point
│   ├── seed.js                # DB seed/fix script
│   ├── .env                   # Environment variables
│   └── src/
│       ├── config/            # DB, Cloudinary, Schema
│       ├── controllers/       # Auth, Complaints, Rewards, Admin
│       ├── middleware/        # JWT Auth
│       └── routes/            # API routes
└── frontend/
    ├── src/
    │   ├── App.jsx            # Router + layout
    │   ├── context/           # AuthContext
    │   ├── services/          # API calls (Axios)
    │   ├── components/        # Sidebar, ProtectedRoute
    │   └── pages/
    │       ├── citizen/       # Dashboard, NewComplaint, MyComplaints, Rewards, Map
    │       ├── worker/        # Dashboard, AssignedComplaints, Map
    │       └── admin/         # Dashboard, Complaints, Users, Workers, Map
    └── index.css              # Global dark theme CSS
```

