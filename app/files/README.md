# To-Do List Web Application

A full-stack to-do list application built with Express.js, Node.js, and PostgreSQL. Features user authentication with JWT tokens and full CRUD operations for tasks.

## Features

✅ **User Authentication**
- User registration with password hashing (bcrypt)
- Login with JWT token generation (24h expiration)
- Secure password storage

✅ **Task Management**
- Add new tasks with title, description, expiration date, and priority
- Edit existing tasks
- Delete tasks
- View all user-specific tasks

✅ **Database**
- Connects to external PostgreSQL database
- Users table: stores username, password, and user ID
- Tasks table: stores title, description, expiration_date, priority, and user_id
- User-specific task isolation

## Project Structure

```
todo-app/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── routes/
│   ├── auth.js           # Registration and login routes
│   └── tasks.js          # Task CRUD routes
├── middleware/
│   └── auth.js           # JWT authentication middleware
└── public/
    ├── index.html        # Frontend HTML
    └── app.js            # Frontend JavaScript
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (local or remote)
- Database tables (see Database Setup below)

## Database Setup

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

**Important:** You must create these tables in your PostgreSQL database before running the application.

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database Connection

Edit `server.js` and update the database connection details:

```javascript
const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',        // e.g., 'localhost'
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});
```

Or use environment variables:

```bash
export DB_USER=your_db_user
export DB_HOST=localhost
export DB_NAME=todo_app
export DB_PASSWORD=your_password
export DB_PORT=5432
export JWT_SECRET=your_secret_key
```

### 3. Start the Application

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The application will be available at: **http://localhost:3000**

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
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
Login and receive JWT token.

**Request Body:**
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

### Tasks

**All task endpoints require JWT authentication:**
```
Authorization: Bearer <your_jwt_token>
```

#### GET /api/tasks
Get all tasks for the authenticated user.

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
Add a new task.

**Request Body:**
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
Edit/update an existing task.

**Request Body:**
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

1. **Register**: Create a new account
2. **Login**: Login to receive a JWT token
3. **Add Tasks**: Create tasks with title, description, expiration date, and priority
4. **Edit Tasks**: Update existing tasks
5. **Delete Tasks**: Remove tasks
6. **Logout**: Clear authentication

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication (24h expiration)
- Protected routes with authentication middleware
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
| `JWT_SECRET` | JWT signing secret | `your_jwt_secret_key_change_in_production` |

## Troubleshooting

### Database Connection Errors

- Verify PostgreSQL is running
- Check database credentials in `server.js`
- Ensure the database exists and tables are created
- Check firewall settings for remote databases

### Authentication Issues

- JWT tokens expire after 24 hours
- Ensure token is sent in Authorization header: `Bearer <token>`
- Check JWT_SECRET matches in `middleware/auth.js` and `routes/auth.js`

### Table Does Not Exist

- Create the users and tasks tables in your database
- Use the SQL commands provided in the Database Setup section

## Notes

- This application connects to an external PostgreSQL database
- No schema files included - tables must be created manually
- JWT tokens are stored in localStorage on the frontend
- Change JWT_SECRET in production
- All passwords are hashed before storage
- Tasks are user-specific and isolated

## License

MIT
