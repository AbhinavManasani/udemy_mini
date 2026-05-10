# Mini Udemy — Open-Source Learning Management System

A full-stack online learning platform with three user roles: **Student**, **Instructor**, and **Admin**.

Built with **React + Tailwind CSS** (frontend) and **Express.js + PostgreSQL** (backend).

---

## Features

### Student
- Browse & search course catalog
- One-click enrollment
- Video player with resume-from-last-position
- Take MCQ quizzes with instant scoring
- Personal dashboard with progress tracking

### Instructor
- Create, edit, delete courses with modules & lectures
- Upload video lectures (Cloudinary integration)
- Build multiple-choice quizzes per module
- View per-course enrollment stats

### Admin
- Platform-wide analytics dashboard
- Manage users (promote/demote roles, deactivate)
- Manage & flag courses
- Key metrics: enrollments, completion rates, active users

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS 3   |
| Backend    | Express.js, Node.js              |
| Database   | PostgreSQL (SQLite for dev)       |
| ORM        | Sequelize                         |
| Auth       | JWT + bcrypt                      |
| Storage    | Cloudinary (free tier)            |
| Video      | React Player                      |

---

## Project Structure

```
mini_udemy/
├── backend/
│   ├── src/
│   │   ├── config/        # DB & cloud config
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/     # Auth & role guards
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API route definitions
│   │   └── seeds/         # Demo data seeder
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Auth context (React Context)
│   │   └── pages/         # Page-level components
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use SQLite for development)

### 1. Clone & Install

```bash
git clone <repo-url> mini_udemy
cd mini_udemy

# Backend
cd backend
cp .env.example .env    # Edit with your DB credentials
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database

**Option A — SQLite (zero config, for development):**
Set `DB_DIALECT=sqlite` in `backend/.env`. The database file is auto-created.

**Option B — PostgreSQL:**
```bash
createdb mini_udemy
# Set DB_DIALECT=postgres and connection details in backend/.env
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
| Role       | Email                 | Password   |
|------------|-----------------------|------------|
| Admin      | admin@miniudemy.com   | admin123   |
| Instructor | instructor@miniudemy.com | pass123 |
| Student 1  | student1@miniudemy.com | pass123   |
| Student 2  | student2@miniudemy.com | pass123   |

Plus 1 sample course with modules, lectures, and a quiz.

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register new user  |
| POST   | /api/auth/login    | Login, get JWT     |
| GET    | /api/auth/me       | Get current user   |

### Courses
| Method | Endpoint               | Description               |
|--------|------------------------|---------------------------|
| GET    | /api/courses           | List all courses          |
| GET    | /api/courses/:id       | Get course detail         |
| POST   | /api/courses           | Create course (instructor)|
| PUT    | /api/courses/:id       | Update course             |
| DELETE | /api/courses/:id       | Delete course             |

### Enrollments
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | /api/enrollments            | Enroll in course       |
| GET    | /api/enrollments/my         | My enrolled courses    |

### Progress
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /api/progress         | Update video progress    |
| GET    | /api/progress/:courseId| Get progress for course  |

### Quizzes
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | /api/quizzes                | Create quiz            |
| GET    | /api/quizzes/module/:id     | Get quiz for module    |
| POST   | /api/quizzes/:id/attempt    | Submit quiz attempt    |
| GET    | /api/quizzes/:id/attempts   | Get attempt history    |

### Admin
| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| GET    | /api/admin/stats     | Platform analytics     |
| GET    | /api/admin/users     | List all users         |
| PUT    | /api/admin/users/:id | Update user role       |

---

## Environment Variables

See `backend/.env.example` for all required variables.

---

## Extensibility

The codebase is designed for easy extension:
- **AI Tutors**: Add a new `/api/ai` route and `AiController`
- **Gamification**: Add `Points`, `Badges`, `Leaderboard` models
- **Certificates**: Add `Certificate` model linked to course completion
- **Discussion Forums**: Add `Thread`, `Post` models per course
- **Payment**: Add Stripe integration in a new `/api/payments` route

---

## License

MIT
