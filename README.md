# NagareConnect

> A civic-tech platform that connects citizens, sanitation workers and administrators to report, track and resolve garbage issues, and rewards people for keeping their community clean.


## Table of Contents

- [About](#about)
- [Features by Role](#-features-by-role)
- [Reward System](#reward-system)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About

NagareConnect lets citizens report garbage problems with a photo and GPS location, lets workers navigate to and resolve assigned complaints, and gives admins a complete view of operations through dashboards, maps and performance tracking. Citizens earn reward points for reporting and for resolved complaints, which they can redeem in a Reward Marketplace.

## 📋 Features by Role

### 🧑 Citizen
- Register / Login
- Report a garbage issue (photo + GPS location)
- Track complaint status: **Pending → In Progress → Resolved**
- View all complaints on Google Maps
- Earn reward points (**+5** on submit, **+20** on resolve)
- Redeem points in the Reward Marketplace

### 👷 Worker
- View assigned complaints
- One-click Google Maps navigation to the complaint location
- Mark complaints **In Progress** / **Resolved**
- Track monthly bonus progress (goal: **100 per month**)

### 🛡️ Admin
- Dashboard with stats, charts and resolution rate
- Manage all complaints and assign them to workers
- User management (enable/disable users, change roles)
- Worker performance tracking
- Bonus eligibility detection (**>100 resolved per month**)
- Map view of all complaints

## Reward System

| Event                         | Who     | Reward                         |
| ----------------------------- | ------- | ------------------------------ |
| Complaint submitted           | Citizen | +5 points                      |
| Complaint resolved            | Citizen | +20 points                     |
| 100+ complaints resolved/month | Worker  | Monthly bonus eligibility      |

Citizens can redeem points in the Reward Marketplace.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend |  HTML/CSS/JS_                       |
| Backend  |  Node.js + Express_                 |
| Database |  MySQL                              |
| Maps     | Leaflet                             |
| Auth     | JWT                                 |

> Replace the placeholders above with your actual stack.

## Project Structure

```
nagareconnect/
├── backend/     # API, role-based auth, complaints, rewards, database access
├── frontend/    # Citizen, Worker and Admin interfaces
└── README.md
```

## Getting Started

### Prerequisites

- Git
- Node.js (v18+) and npm (adjust to your stack)
- A database instance
- A Google Maps API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ashirwadguru01/nagareconnect.git
   cd nagareconnect
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env   # then fill in the values
   npm start
   ```

3. **Set up the frontend** (in a new terminal)

   ```bash
   cd frontend
   npm install
   npm start
   ```
4. Open the app at `http://localhost:3000` (or the port shown in the terminal).

## Environment Variables

Create a `.env` file inside `backend/` (and the frontend if needed):

```env
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key
```

> Leaflet with OpenStreetMap tiles needs no API key, so no map key is required.
> Never commit your `.env` file. Add it to `.gitignore`.

## Usage

1. Sign up as a **Citizen** and report a garbage issue with a photo and location.
2. An **Admin** reviews the complaint and assigns it to a **Worker**.
3. The Worker navigates to the spot via Google Maps and marks it In Progress, then Resolved.
4. The Citizen sees the status update and earns reward points to redeem in the marketplace.


## Contact

**Ashirwad Guru** — [@ashirwadguru01](https://github.com/ashirwadguru01)

Project link: [https://github.com/ashirwadguru01/nagareconnect](https://github.com/ashirwadguru01/nagareconnect)
