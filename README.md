# ⚡ TaskFlow — Scalable REST API with JWT Auth & RBAC

A production-ready backend API with JWT authentication, role-based access control, and a React frontend. Built for the PrimeTrade Backend Intern assignment.

---

## 🏗️ Tech Stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Backend          | Node.js, Express.js                          |
| ORM              | Prisma                                       |
| Database         | PostgreSQL                                   |
| Auth             | JWT (jsonwebtoken) + bcryptjs                |
| Validation       | express-validator                            |
| API Docs         | Swagger (swagger-jsdoc + swagger-ui-express) |
| Logging          | Winston + Morgan                             |
| Frontend         | React.js, React Router v6, Axios             |
| Containerization | Docker + Docker Compose                      |

---

## 🚀 Quick Start (Local)

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Setup Backend

```bash
git clone <your-repo-url>
cd taskflow/backend

cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

npm install
npx prisma migrate dev --name init
npm run dev
```

### 2. Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

Visit: `http://localhost:3000`

---

## 🐳 Docker Setup (Recommended)

```bash
# From root of project
docker-compose up --build
```

| Service      | URL                            |
| ------------ | ------------------------------ |
| Frontend     | http://localhost:3000          |
| Backend API  | http://localhost:5000          |
| Swagger Docs | http://localhost:5000/api/docs |

---

## 📚 API Documentation

Full Swagger UI: `http://localhost:5000/api/docs`

### Base URL: `/api/v1`

---

### 🔐 Authentication Endpoints

| Method | Endpoint                | Auth | Description                |
| ------ | ----------------------- | ---- | -------------------------- |
| POST   | `/auth/register`        | ❌   | Register new user          |
| POST   | `/auth/login`           | ❌   | Login, get JWT token       |
| GET    | `/auth/profile`         | ✅   | Get logged-in user profile |
| PUT    | `/auth/change-password` | ✅   | Change password            |

**Register Example:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'
```

**Login Example:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123"}'
```

---

### ✅ Task Endpoints (Auth required)

| Method | Endpoint       | Role       | Description                        |
| ------ | -------------- | ---------- | ---------------------------------- |
| GET    | `/tasks`       | USER/ADMIN | List tasks (paginated, filterable) |
| POST   | `/tasks`       | USER/ADMIN | Create task                        |
| GET    | `/tasks/:id`   | USER/ADMIN | Get task by ID                     |
| PUT    | `/tasks/:id`   | USER/ADMIN | Update task                        |
| DELETE | `/tasks/:id`   | USER/ADMIN | Delete task                        |
| GET    | `/tasks/stats` | USER/ADMIN | Task statistics                    |

**Query params for GET /tasks:**

- `page`, `limit` — pagination
- `status` — `PENDING` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`
- `priority` — `LOW` | `MEDIUM` | `HIGH`
- `search` — searches title and description
- `sortBy`, `sortOrder` — e.g. `createdAt desc`

**Create Task Example:**

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix login bug","priority":"HIGH","status":"IN_PROGRESS","dueDate":"2024-12-31"}'
```

---

### 👥 User Endpoints (Admin only)

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/users`          | List all users (paginated) |
| GET    | `/users/:id`      | Get user by ID             |
| PATCH  | `/users/:id/role` | Promote/demote user role   |
| DELETE | `/users/:id`      | Delete user                |

---

## 🗄️ Database Schema

```
users
├── id          UUID (PK)
├── email       String (unique)
├── password    String (bcrypt hashed)
├── name        String
├── role        Enum: USER | ADMIN
├── createdAt   DateTime
└── updatedAt   DateTime

tasks
├── id          UUID (PK)
├── title       String
├── description String?
├── status      Enum: PENDING | IN_PROGRESS | COMPLETED | CANCELLED
├── priority    Enum: LOW | MEDIUM | HIGH
├── dueDate     DateTime?
├── userId      UUID (FK → users.id, CASCADE DELETE)
├── createdAt   DateTime
└── updatedAt   DateTime
```

---

## 🔒 Security Practices

- **Password Hashing**: bcrypt with cost factor 12
- **JWT**: Signed with HS256, verified on every protected route
- **Helmet.js**: Secure HTTP headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: express-validator on all inputs
- **RBAC**: Role checked at middleware level before any controller logic
- **Input Sanitization**: email normalized, strings trimmed
- **Error Masking**: Stack traces hidden in production

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # DB schema & enums
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # Prisma client
│   │   │   └── swagger.js       # Swagger config
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT + RBAC
│   │   │   └── validate.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── user.routes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── logger.js
│   │   │   └── response.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── task.validator.js
│   │   └── index.js             # App entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/index.js         # Axios client
│   │   ├── context/AuthContext.js
│   │   ├── components/Layout.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Tasks.js
│   │   │   └── AdminUsers.js
│   │   ├── App.js
│   │   └── App.css
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## 📈 Scalability Notes

### Current Architecture

Monolithic Express app with clear module boundaries — controllers, routes, middleware, validators — designed to be split into microservices with minimal refactoring.

### Scaling Strategy

**Horizontal Scaling**

- Stateless JWT auth enables multiple backend instances behind a load balancer (e.g. Nginx, AWS ALB)
- Database connection pooling via Prisma's built-in pool

**Caching (Redis — next step)**

- Cache `/tasks/stats` and `/users` list responses with a 60s TTL
- Session-level rate limiting via Redis for distributed deployments

**Microservices Path**

- `auth-service` — handles registration, login, token issuance
- `task-service` — CRUD, owned by task domain
- `user-service` — admin user management
- Services communicate via REST or message queues (RabbitMQ/Kafka)

**Database**

- Read replicas for heavy GET queries
- Index on `tasks.userId`, `tasks.status`, `tasks.priority` for fast filtering
- Partitioning tasks table by `createdAt` for archival at scale

**Observability**

- Winston logs shipped to CloudWatch / Datadog
- Health check endpoint `/health` ready for load balancer probes
- Add Prometheus metrics middleware for production monitoring

---

## 📬 Postman Collection

Import the file `TaskFlow.postman_collection.json` (in repo root) or use Swagger UI at `/api/docs`.

**Environment variables for Postman:**

- `base_url`: `http://localhost:5000/api/v1`
- `token`: (auto-set after login via test script)

---

## 📧 Contact

Built by Subha Pattanayak
email: hellocoder78@gmail.com
