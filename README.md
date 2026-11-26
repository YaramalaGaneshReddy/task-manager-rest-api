# Task Manager REST API

A secure backend REST API for user registration, login, and personal task management. It uses Node.js, Express.js, SQLite, JWT bearer authentication, and bcrypt password hashing.

## Features

- Case-insensitive unique email registration
- bcrypt password hashing with work factor 12
- JWT authentication with a configurable 24-hour default expiry
- Authenticated create, read, update, and delete operations
- Strict per-user task ownership
- Express validation with consistent JSON errors
- SQLite foreign-key enforcement and automatic schema initialization

## Technology Stack

- Node.js
- Express.js
- JavaScript (CommonJS)
- SQLite with `better-sqlite3`
- `jsonwebtoken`
- `bcryptjs`
- `dotenv`
- `express-validator`
- `nodemon`

## Prerequisites

- Node.js 18 or newer
- npm

## Installation

```powershell
cd C:\path\to\task-manager-rest-api
npm install
```

## Environment Setup

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

Set a unique long secret in `.env`:

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
DATABASE_PATH=./database/tasks.db
```

Do not commit `.env`. A suitable local secret can be generated from a Node.js command, for example:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Run the API

```powershell
npm start
```

Development mode with automatic restart:

```powershell
npm run dev
```

The server listens on `http://localhost:5000` by default.

## Database Initialization

The application automatically creates `database/tasks.db` and these tables:

- `users`
- `tasks`

It enables SQLite foreign keys on every connection. Deleting a user cascades to that user's tasks. The database file is ignored by Git and must not contain real personal data when shared.

## API Endpoints

### Health

`GET /api/health`

Authentication: not required.

Success `200`:

```json
{
  "status": "ok",
  "database": "connected"
}
```

### Register

`POST /api/auth/register`

Authentication: not required.

Headers:

```http
Content-Type: application/json
```

Request:

```json
{
  "name": "Ganesh",
  "email": "ganesh@example.com",
  "password": "StrongPass123"
}
```

Success `201`:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Ganesh",
    "email": "ganesh@example.com"
  }
}
```

Errors: `400` validation failure, `409` duplicate email.

### Login

`POST /api/auth/login`

Authentication: not required.

Request:

```json
{
  "email": "ganesh@example.com",
  "password": "StrongPass123"
}
```

Success `200`:

```json
{
  "message": "Login successful",
  "token": "<jwt-token>",
  "user": {
    "id": 1,
    "name": "Ganesh",
    "email": "ganesh@example.com"
  }
}
```

Unknown email and incorrect password use the same `401` response:

```json
{
  "message": "Invalid email or password"
}
```

The token expires after `JWT_EXPIRES_IN`, defaulting to `24h`.

### Create Task

`POST /api/tasks`

Authentication: required.

Headers:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

Request:

```json
{
  "title": "Complete internship Task 2",
  "description": "Build and test the CRUD REST API",
  "status": "pending"
}
```

Success `201`:

```json
{
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "title": "Complete internship Task 2",
    "description": "Build and test the CRUD REST API",
    "status": "pending",
    "created_at": "2026-11-26T10:00:00.000Z",
    "updated_at": "2026-11-26T10:00:00.000Z"
  }
}
```

Errors: `400` validation failure, `401` missing or invalid token.

### List Tasks

`GET /api/tasks`

Authentication: required.

Success `200`:

```json
{
  "count": 1,
  "tasks": [
    {
      "id": 1,
      "title": "Complete internship Task 2",
      "description": "Build and test the CRUD REST API",
      "status": "pending",
      "created_at": "2026-11-26T10:00:00.000Z",
      "updated_at": "2026-11-26T10:00:00.000Z"
    }
  ]
}
```

### Get One Task

`GET /api/tasks/:id`

Authentication: required.

Success `200`:

```json
{
  "task": {
    "id": 1,
    "title": "Complete internship Task 2",
    "description": "Build and test the CRUD REST API",
    "status": "pending",
    "created_at": "2026-11-26T10:00:00.000Z",
    "updated_at": "2026-11-26T10:00:00.000Z"
  }
}
```

Errors: `400` invalid ID, `401` missing or invalid token, `404` task not found or not owned.

### Update Task

`PUT /api/tasks/:id`

Authentication: required.

Request:

```json
{
  "title": "Finish and test internship Task 2",
  "description": "Complete CRUD, authentication, and Postman tests",
  "status": "in_progress"
}
```

Success `200`:

```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 1,
    "title": "Finish and test internship Task 2",
    "description": "Complete CRUD, authentication, and Postman tests",
    "status": "in_progress",
    "created_at": "2026-11-26T10:00:00.000Z",
    "updated_at": "2026-11-26T10:30:00.000Z"
  }
}
```

Errors: `400` empty or invalid update, `401` missing or invalid token, `404` task not found or not owned.

### Delete Task

`DELETE /api/tasks/:id`

Authentication: required.

Success `200`:

```json
{
  "message": "Task deleted successfully"
}
```

Errors: `400` invalid ID, `401` missing or invalid token, `404` task not found or not owned.

### Validation Error Format

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

Unknown routes return `404`:

```json
{
  "message": "Route not found"
}
```

## Testing with Postman

1. Start the API and send `GET /api/health`.
2. Register a user with `POST /api/auth/register`.
3. Log in with `POST /api/auth/login` and copy the returned token.
4. Open the Postman Authorization tab or set this header on task requests:
   ```http
   Authorization: Bearer <jwt-token>
   ```
5. Test task create, list, get, update, and delete operations.
6. Register a second user and verify that the first user's task ID returns `404` for the second user.

Automated tests can be run with:

```powershell
npm test
```

The tests cover health, validation, registration, login, password hashing, protected routes, CRUD operations, and cross-user isolation using an in-memory SQLite database.

## Project Structure

```text
task-manager-rest-api/
├── src/
│   ├── config/database.js
│   ├── controllers/authController.js
│   ├── controllers/taskController.js
│   ├── middleware/authMiddleware.js
│   ├── middleware/errorMiddleware.js
│   ├── middleware/validateRequest.js
│   ├── routes/authRoutes.js
│   ├── routes/taskRoutes.js
│   ├── validators/authValidators.js
│   ├── validators/taskValidators.js
│   ├── app.js
│   └── server.js
├── database/.gitkeep
├── tests/api.test.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── spec.md
```

## Security Notes and Limitations

- JWTs should be kept secret and are not invalidated on logout because this API has no revocation store.
- Passwords are never returned and are stored only as bcrypt hashes.
- Task ownership is always checked with the JWT-derived user ID and parameterized SQL.
- The API does not implement refresh tokens, rate limiting, role-based access control, HTTPS termination, or account email verification.
- Deploy behind HTTPS and use a secret generated from a cryptographically secure random source.
