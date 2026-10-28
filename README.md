# TaskFlow — Project Management Tool

A lightweight project management platform built with the MERN stack. Create projects, organize tasks on a Kanban board, assign work to team members, and track progress.

**Built as CodeAlpha Full Stack Development Internship — Task 3.**

![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4)

---

## Features

- **Authentication** — Register, login, JWT-protected routes
- **Projects** — Create, edit, delete projects with team members
- **Task Management** — Full CRUD with priority levels and status tracking
- **Kanban Board** — Drag-and-drop task board (To Do → In Progress → Completed)
- **Team Collaboration** — Invite members by email, assign tasks
- **Comments** — Discuss tasks with threaded comments
- **Notifications** — Get notified on assignments, invitations, and deadlines
- **Dashboard** — Overview cards, charts, recent activity
- **Responsive** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Recharts  |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB Atlas, Mongoose                 |
| Auth       | JWT, bcrypt                             |
| Drag & Drop| @dnd-kit                                |
| Icons      | Lucide React                            |

---

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder (see `.env.example`):

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

The API will run on `http://localhost:5000`.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 4. Seed demo data (optional)

To populate the database with sample projects, tasks, and users:

```bash
cd backend
npm run seed
```

Demo accounts created by the seed script:

| Name          | Email              | Password    |
| ------------- | ------------------ | ----------- |
| John Doe      | john@example.com   | password123 |
| Sarah Wilson   | sarah@example.com  | password123 |
| Mike Johnson   | mike@example.com   | password123 |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth & error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seed.js          # Demo data script
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (auth)
│   │   ├── services/    # API service layer
│   │   ├── hooks/       # Custom React hooks
│   │   ├── App.jsx      # Router setup
│   │   └── main.jsx     # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description       | Auth |
| ------ | -------------------- | ----------------- | ---- |
| POST   | /api/auth/register   | Register user     | No   |
| POST   | /api/auth/login      | Login user        | No   |
| GET    | /api/auth/me         | Get current user  | Yes  |

### Projects

| Method | Endpoint                          | Description        | Auth |
| ------ | --------------------------------- | ------------------ | ---- |
| GET    | /api/projects                     | List user projects | Yes  |
| POST   | /api/projects                     | Create project     | Yes  |
| GET    | /api/projects/:id                 | Get project        | Yes  |
| PUT    | /api/projects/:id                 | Update project     | Yes  |
| DELETE | /api/projects/:id                 | Delete project     | Yes  |
| POST   | /api/projects/:id/members         | Add member         | Yes  |
| DELETE | /api/projects/:id/members/:userId | Remove member      | Yes  |

### Tasks

| Method | Endpoint         | Description          | Auth |
| ------ | ---------------- | -------------------- | ---- |
| GET    | /api/tasks       | Get tasks (by project) | Yes |
| GET    | /api/tasks/my    | Get my assigned tasks  | Yes |
| POST   | /api/tasks       | Create task          | Yes  |
| PUT    | /api/tasks/:id   | Update task          | Yes  |
| DELETE | /api/tasks/:id   | Delete task          | Yes  |

### Comments

| Method | Endpoint                      | Description      | Auth |
| ------ | ----------------------------- | ---------------- | ---- |
| GET    | /api/tasks/:taskId/comments   | Get comments     | Yes  |
| POST   | /api/tasks/:taskId/comments   | Add comment      | Yes  |
| DELETE | /api/comments/:id             | Delete comment   | Yes  |

### Notifications

| Method | Endpoint                       | Description       | Auth |
| ------ | ------------------------------ | ----------------- | ---- |
| GET    | /api/notifications             | Get notifications | Yes  |
| PUT    | /api/notifications/:id/read    | Mark as read      | Yes  |
| PUT    | /api/notifications/read-all    | Mark all read     | Yes  |

---

## Screenshots

*Add screenshots of the dashboard, Kanban board, and project views here.*

---

## License

This project was built for the **CodeAlpha Full Stack Development Internship**.

---

Made with ❤️ by [Your Name]
