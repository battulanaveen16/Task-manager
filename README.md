# TaskFlow — Team Task Manager

A full-stack collaborative task management web app where teams can create projects, assign tasks, and track progress with role-based access control.

---

## 🚀 Live Demo

> Replace with your Railway URL after deployment  
> **https://your-app.railway.app**

---

## 📸 Features

- **Auth**: JWT-based signup/login with secure password hashing
- **Projects**: Create projects, add/remove members, two roles (Admin / Member)
- **Tasks**: Create tasks with title, description, due date, priority; assign to members; kanban board view
- **Dashboard**: Charts — tasks by status, tasks per user, overdue count
- **Role-Based Access**: Admins manage everything; Members can only update status of their tasks
- **Responsive** dark UI built in React + Recharts

---

## 🏗 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, React Router, Recharts, Lucide |
| Backend    | Node.js, Express                  |
| Database   | SQLite (via better-sqlite3)       |
| Auth       | JWT (jsonwebtoken + bcryptjs)     |
| Deployment | Railway                           |

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── db/
│   │   └── database.js        # SQLite init & schema
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── routes/
│   │   ├── auth.js            # Signup, login, /me
│   │   ├── projects.js        # CRUD + members
│   │   ├── tasks.js           # CRUD + role checks
│   │   └── dashboard.js       # Stats aggregation
│   ├── server.js              # Express app entry
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx     # Sidebar + nav
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   └── MyTasksPage.jsx
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json               # Root scripts
├── railway.toml               # Railway config
├── Procfile
└── .gitignore
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone / unzip the project
```bash
# If using zip:
unzip task-manager.zip
cd task-manager

# If cloning from GitHub:
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env — set a strong JWT_SECRET
npm install
```

### 3. Frontend setup
```bash
cd ../frontend
cp .env.example .env
# .env already points to http://localhost:5000/api for local dev
npm install
```

### 4. Run locally (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev      # uses nodemon; server starts on :5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev      # Vite starts on :5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/users` | List all users |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Project + members |
| PUT | `/api/projects/:id` | Update (Admin) |
| DELETE | `/api/projects/:id` | Delete (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?projectId=x` | List tasks |
| POST | `/api/tasks` | Create task (Admin) |
| GET | `/api/tasks/:id` | Task detail |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Global stats |
| GET | `/api/dashboard?projectId=x` | Project stats |

**Auth header:** `Authorization: Bearer <token>`

---

## 🚢 Deployment on Railway

### Step 1 — Push code to GitHub first
*(See GitHub steps below)*

### Step 2 — Create Railway account
1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub and select this repository

### Step 3 — Set Environment Variables
In Railway dashboard → your service → **Variables**, add:

```
NODE_ENV=production
JWT_SECRET=your_very_long_random_secret_string_here
PORT=5000
```

> Railway auto-injects `PORT`. The `FRONTEND_URL` is not needed since the backend serves the built frontend.

### Step 4 — Configure Build & Deploy
Railway auto-detects `railway.toml`. It will:
1. Run `npm run install:all` (installs backend + frontend deps)
2. Run `npm run build` (builds React app into `frontend/dist/`)
3. Run `npm start` (starts Express, which serves the frontend)

### Step 5 — Generate a Domain
Railway dashboard → Settings → **Generate Domain** → your public URL is ready!

---

## 📤 GitHub Setup (Step-by-Step)

### If starting fresh from the zip file:

```bash
# 1. Go into the project folder
cd task-manager

# 2. Initialize git
git init

# 3. Add all files
git add .

# 4. First commit
git commit -m "feat: initial commit — TaskFlow full-stack app"

# 5. Go to github.com → click "New repository"
#    Name it: task-manager
#    Keep it Public (or Private)
#    Do NOT add README/gitignore (you already have them)
#    Click "Create repository"

# 6. Link and push (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git branch -M main
git push -u origin main
```

### Ongoing workflow after changes:
```bash
git add .
git commit -m "fix: describe what you changed"
git push
```

Railway will auto-redeploy when you push to `main`.

---

## 🔐 Environment Variables Reference

### Backend `.env`
```
PORT=5000
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DB_PATH=./data.db
```

### Frontend `.env` (local dev only)
```
VITE_API_URL=http://localhost:5000/api
```
> In production, the frontend is served by the backend, so `VITE_API_URL` defaults to `/api` (same origin). No frontend `.env` needed on Railway.

---

## 🗃 Database Schema

```sql
users         (id, name, email, password, created_at)
projects      (id, name, description, creator_id, created_at)
project_members (id, project_id, user_id, role, joined_at)
tasks         (id, title, description, due_date, priority, status,
               project_id, created_by, assigned_to, created_at, updated_at)
```

---

## 🔒 Role-Based Access Rules

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/edit/delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| View project tasks | ✅ (all) | ✅ (assigned/created) |

---

## 🛠 Troubleshooting

**"Cannot connect to database"**  
→ Check `DB_PATH` in `.env`; the backend creates the SQLite file automatically.

**"401 Unauthorized" on all requests**  
→ JWT token expired or missing. Log out and log in again.

**Railway build fails**  
→ Check that `NODE_ENV=production` and `JWT_SECRET` are set in Railway Variables.

**Frontend shows blank page**  
→ Check browser console. If API calls fail, verify `VITE_API_URL` in frontend `.env`.

---

## 📝 License

MIT — free to use for educational and commercial purposes.
