# To-Do List Web Application

A full-stack to-do list application that connects to an external PostgreSQL database. Built with Express.js, Node.js, and PostgreSQL with JWT authentication.

## Project Structure

**Folder structure matches API mount points:**

```
todo-app/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── api/                   # API routes (folder structure matches mount points)
│   ├── auth/             # → Mounted at /api/auth
│   │   └── index.js      # Registration & Login routes
│   └── tasks/            # → Mounted at /api/tasks
│       └── index.js      # Task CRUD routes
└── public/               # Static frontend files
    ├── index.html        # Frontend HTML
    └── app.js            # Frontend JavaScript
```

### Mount Point Architecture

The application uses a clean architecture where folder paths directly match API endpoints:

| Folder Path | Mount Point | Routes |
|------------|-------------|---------|
| `api/auth/` | `/api/auth` | `/register`, `/login` |
| `api/tasks/` | `/api/tasks` | `/` (GET, POST), `/:id` (PUT, DELETE) |

## Features

✅ **User Authentication**
- User registration with password hashing (bcrypt)
- Login with JWT token generation (24h expiration)
- Token-based authentication for protected routes

✅ **Task Management**
- Add tasks with title, description, expiration date, and priority
- Edit existing tasks
- Delete tasks
- View all user-specific tasks

✅ **External Database Connection**
- Connects to external PostgreSQL database
- No schema files - assumes tables already exist
- All queries route to external database

## Database Requirements

**This application requires an external PostgreSQL database with the following tables:**

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    expiration_date DATE,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Note:** You must create these tables in your PostgreSQL database before running the application.

## Installation & Setup

### 1. Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (local or remote)
- Database tables created (see Database Requirements above)

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database Connection

**Option A: Edit server.js directly**

Open `server.js` and update the Pool configuration:

```javascript
const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',        // e.g., 'localhost' or 'db.example.com'
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});
```

**Option B: Use environment variables (recommended)**

```bash
export DB_USER=your_db_user
export DB_HOST=your_db_host
export DB_NAME=your_db_name
export DB_PASSWORD=your_db_password
export DB_PORT=5432
export JWT_SECRET=your_secret_key_here
```

Or create a `.env` file and use a package like `dotenv`.

### 4. Start the Application

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The application will be available at: **http://localhost:3000**

## API Documentation

### Authentication Routes (`/api/auth`)

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "created_at": "2025-12-25T10:30:00.000Z"
  }
}
```

#### POST /api/auth/login
Login user and receive JWT token.

**Request:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

### Task Routes (`/api/tasks`)

**All task routes require JWT authentication:**
```
Authorization: Bearer <your_jwt_token>
```

#### GET /api/tasks
Get all tasks for authenticated user.

**Response (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the todo app",
      "expiration_date": "2025-12-31",
      "priority": "high",
      "user_id": 1,
      "created_at": "2025-12-25T10:30:00.000Z",
      "updated_at": "2025-12-25T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/tasks
Create a new task.

**Request:**
```json
{
  "title": "Complete project",
  "description": "Finish the todo app",
  "expiration_date": "2025-12-31",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": { ... }
}
```

#### PUT /api/tasks/:id
Update an existing task.

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "expiration_date": "2025-12-31",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": { ... }
}
```

#### DELETE /api/tasks/:id
Delete a task.

**Response (200):**
```json
{
  "message": "Task deleted successfully",
  "task": { ... }
}
```

## Usage

1. **Register**: Create a new account with username and password
2. **Login**: Login to receive a JWT token (stored in localStorage)
3. **Add Tasks**: Create tasks with title, description, date, and priority
4. **Manage Tasks**: Edit or delete your tasks
5. **Logout**: Clear authentication and return to login screen

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (external)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt
- **Frontend:** Vanilla JavaScript, HTML5, CSS3

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication (24h expiration)
- Protected routes with middleware
- SQL injection prevention (parameterized queries)
- User isolation (users can only access their own tasks)
- Input validation on all endpoints

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_HOST` | Database host | `localhost` |
| `DB_NAME` | Database name | `todo_app` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `JWT_SECRET` | JWT signing key | `your_jwt_secret_key_change_in_production` |

## Troubleshooting

### Database Connection Errors

**Error:** `connection refused`
- Ensure PostgreSQL is running
- Verify host, port, and credentials in `server.js`
- Check firewall settings if connecting to remote database

**Error:** `relation "users" does not exist`
- Create the required tables in your database (see Database Requirements)

### Authentication Issues

**Error:** `Invalid or expired token`
- Token expires after 24 hours - login again
- Ensure token is sent in Authorization header: `Bearer <token>`

### Port Already in Use

Change the port in `server.js` or use environment variable:
```bash
export PORT=3001
npm start
```

## Notes

- This application connects to an **external database** - no schema files included
- Database tables must be created **before** running the application
- JWT secret should be changed in production and stored securely
- Frontend stores JWT token in localStorage
- All API routes are prefixed with `/api`

## License

MIT
