# Task Manager REST API — Project Specification

## 1. Project Overview

Build a secure, well-documented **Task Manager REST API** as Internship Task 2 for **Valentius Kryptix**.

The API must allow users to register, log in, and manage their own tasks. It must implement complete CRUD operations, token-based authentication, input validation, correct HTTP status codes, and clear API documentation.

This project is a backend REST API. Do not build a frontend unless explicitly requested.

## 2. Technology Stack

Use the following stack:

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (CommonJS)
- **Database:** SQLite
- **Database library:** `better-sqlite3` (or another actively maintained SQLite package if compatibility requires it)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Password hashing:** `bcryptjs` or `bcrypt`
- **Environment variables:** `dotenv`
- **Validation:** `express-validator`
- **Development:** `nodemon`
- **API testing:** Postman

Use stable, compatible package versions. Do not add unnecessary dependencies.

## 3. Core Features

### 3.1 User Registration

Endpoint: `POST /api/auth/register`

Request body:

```json
{
  "name": "Ganesh",
  "email": "ganesh@example.com",
  "password": "StrongPass123"
}
```

Requirements:

- All fields are required.
- Trim the name and email.
- Validate the email format.
- Require a password of at least 8 characters.
- Reject duplicate email addresses (email comparison should be case-insensitive).
- Hash the password before saving it. Never store or return a plain-text password.
- Return `201 Created` when registration succeeds.
- Do not expose password hashes in API responses.

Example success response:

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

### 3.2 User Login

Endpoint: `POST /api/auth/login`

Request body:

```json
{
  "email": "ganesh@example.com",
  "password": "StrongPass123"
}
```

Requirements:

- Validate required fields and email format.
- Find the user by email.
- Compare the submitted password with the stored password hash.
- Return a signed JWT if credentials are valid.
- Return the same generic authentication error for an unknown email or incorrect password.
- Never return the password or password hash.

Example success response:

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

### 3.3 Task Resource

Each authenticated user can manage only their own tasks.

Task fields:

| Field | Type | Rules |
|---|---|---|
| `id` | Integer | Auto-generated primary key |
| `user_id` | Integer | Owner; references users.id |
| `title` | String | Required, 1–100 characters |
| `description` | String | Optional, maximum 500 characters |
| `status` | String | `pending`, `in_progress`, or `completed`; defaults to `pending` |
| `created_at` | Date/time | Generated automatically |
| `updated_at` | Date/time | Generated automatically and updated on edits |

### 3.4 Create a Task

Endpoint: `POST /api/tasks`

Authentication: Required.

Request body:

```json
{
  "title": "Complete internship Task 2",
  "description": "Build and test the CRUD REST API",
  "status": "pending"
}
```

Requirements:

- Require a non-empty title.
- Validate title and description lengths.
- If status is supplied, accept only `pending`, `in_progress`, or `completed`.
- Associate the task with the authenticated user from the verified JWT. Never accept `user_id` from the request body.
- Return `201 Created`.

### 3.5 Get All Tasks

Endpoint: `GET /api/tasks`

Authentication: Required.

Requirements:

- Return only tasks owned by the authenticated user.
- Return an empty array if the user has no tasks.
- Do not expose another user's tasks.

Example response:

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

### 3.6 Get a Task by ID

Endpoint: `GET /api/tasks/:id`

Authentication: Required.

Requirements:

- Validate that `id` is a positive integer.
- Return the task only if it belongs to the authenticated user.
- Return `404 Not Found` if it does not exist or belongs to another user.

### 3.7 Update a Task

Endpoint: `PUT /api/tasks/:id`

Authentication: Required.

Request body example:

```json
{
  "title": "Finish and test internship Task 2",
  "description": "Complete CRUD, authentication, and Postman tests",
  "status": "in_progress"
}
```

Requirements:

- Validate the task ID.
- Validate all supplied fields.
- Reject an empty update body.
- Update only the authenticated user's task.
- Update `updated_at`.
- Return the updated task.
- Return `404 Not Found` if the task does not exist or is not owned by the user.

### 3.8 Delete a Task

Endpoint: `DELETE /api/tasks/:id`

Authentication: Required.

Requirements:

- Validate the task ID.
- Delete only the authenticated user's task.
- Return `404 Not Found` if it does not exist or is not owned by the user.
- Return `200 OK` with a confirmation message (or `204 No Content`; choose one consistently and document it).

## 4. Authentication and Security

- Use JWT bearer-token authentication.
- Read the JWT secret from `JWT_SECRET` in the `.env` file.
- Set a reasonable token expiry, such as `1h` or `24h`, and document it.
- Protected requests must include:

```http
Authorization: Bearer <jwt-token>
```

- Create authentication middleware that verifies the token and attaches the authenticated user's ID to the request.
- Return `401 Unauthorized` when the token is missing, invalid, or expired.
- Never trust a user ID supplied by the client for ownership decisions.
- Hash passwords with bcrypt using a suitable work factor (10 or higher).
- Use parameterized queries or the database library's safe parameter binding. Never build SQL by concatenating untrusted input.
- Enable SQLite foreign-key enforcement.
- Do not commit `.env`, database files containing user data, or secrets to Git.
- Add a `.env.example` containing placeholder values only.

## 5. HTTP Status Codes

Use status codes consistently:

| Status | Meaning | When to use |
|---|---|---|
| `200` | OK | Successful reads, updates, login, and documented delete response |
| `201` | Created | Successful registration or task creation |
| `400` | Bad Request | Invalid input or validation failure |
| `401` | Unauthorized | Missing, invalid, or expired authentication token; invalid login |
| `403` | Forbidden | Use only when an authenticated user lacks permission and the resource is not being concealed with a 404 |
| `404` | Not Found | Unknown route or task not found/not owned by current user |
| `409` | Conflict | Duplicate email during registration |
| `500` | Internal Server Error | Unexpected server-side failure |

For validation errors, return a clear, consistent JSON response, for example:

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

Do not return stack traces, SQL details, password hashes, or secrets to clients.

## 6. Suggested Project Structure

Create a clean, maintainable structure similar to:

```text
task-manager-api/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validateRequest.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── taskValidators.js
│   ├── app.js
│   └── server.js
├── database/
│   └── .gitkeep
├── tests/
│   └── (optional automated tests)
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── spec.md
```

You may adjust the structure if there is a clear reason, but keep responsibilities separated. Do not put the entire application in one file.

## 7. Database Design

Create two tables.

### users

- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `name`: TEXT NOT NULL
- `email`: TEXT NOT NULL UNIQUE
- `password_hash`: TEXT NOT NULL
- `created_at`: TEXT NOT NULL

### tasks

- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id`: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `title`: TEXT NOT NULL
- `description`: TEXT
- `status`: TEXT NOT NULL DEFAULT 'pending'
- `created_at`: TEXT NOT NULL
- `updated_at`: TEXT NOT NULL

Add appropriate constraints where practical. Create tables automatically when the application starts, or provide a clear initialization script. Enable foreign keys for every SQLite connection.

## 8. API Route Summary

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Log in and receive JWT |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks` | Yes | Get current user's tasks |
| GET | `/api/tasks/:id` | Yes | Get one owned task |
| PUT | `/api/tasks/:id` | Yes | Update one owned task |
| DELETE | `/api/tasks/:id` | Yes | Delete one owned task |
| GET | `/api/health` | No | Check API health |

Also implement a JSON `404` response for unknown routes.

## 9. Environment Variables

Use `.env` locally:

```env
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=24h
DATABASE_PATH=./database/tasks.db
```

Commit only `.env.example` with placeholder values. Add `.env` and the generated SQLite database to `.gitignore`.

## 10. README Requirements

Create a professional `README.md` that includes:

1. Project title and overview.
2. Features.
3. Technology stack.
4. Prerequisites.
5. Installation instructions.
6. Environment variable setup.
7. How to run the application.
8. Database initialization details.
9. Every endpoint with:
   - HTTP method and path
   - Whether authentication is required
   - Headers
   - Example request body
   - Example success response
   - Relevant error responses
10. How to test using Postman.
11. Example JWT usage.
12. Project folder structure.
13. Security notes and known limitations.

Include accurate examples that match the implemented API. Do not document features that have not been implemented.

## 11. Testing Checklist

Test the following scenarios in Postman before submission:

### Authentication

- [ ] Register with valid details — expect `201`.
- [ ] Register with missing or invalid fields — expect `400`.
- [ ] Register with an already-used email — expect `409`.
- [ ] Confirm passwords are hashed in the database.
- [ ] Log in with correct credentials — expect `200` and a JWT.
- [ ] Log in with an incorrect password — expect `401`.
- [ ] Log in with an unknown email — expect `401`.

### Protected routes

- [ ] Call each task endpoint without a token — expect `401`.
- [ ] Call with an invalid token — expect `401`.
- [ ] Call with an expired token — expect `401`.

### CRUD

- [ ] Create a valid task — expect `201`.
- [ ] Create a task with an empty title — expect `400`.
- [ ] Get all tasks — expect only the logged-in user's tasks.
- [ ] Get a task by a valid ID — expect `200`.
- [ ] Get a nonexistent task — expect `404`.
- [ ] Update a task with valid data — expect `200`.
- [ ] Update with invalid data or an empty body — expect `400`.
- [ ] Delete a task — expect the documented success status.
- [ ] Get the deleted task — expect `404`.

### User data isolation

- [ ] Register/login as User A and create a task.
- [ ] Register/login as User B.
- [ ] Confirm User B cannot list, read, update, or delete User A's task.
- [ ] Confirm User A can still access their own task.

### General

- [ ] Unknown endpoint returns JSON `404`.
- [ ] Unexpected errors return a safe JSON `500` response.
- [ ] No secrets or `.env` file are committed.
- [ ] README examples match actual API behavior.

## 12. GitHub Submission

- Create a public GitHub repository named `task-manager-rest-api` (or another clear name).
- Push the complete source code.
- Include `README.md`, `spec.md`, `.env.example`, and `.gitignore`.
- Do not upload `.env`, real secrets, or a database containing personal data.
- Verify that a fresh clone can be installed and started by following the README.
- Submit the public repository URL to Valentius Kryptix.

## 13. Instructions for Codex

Work through this specification carefully.

1. First inspect the existing workspace. If it already contains code, understand it before changing anything.
2. Present a short implementation plan and the proposed file structure before making major changes.
3. Implement the project in small, logical stages. Do not generate an unnecessarily complicated architecture.
4. Create the database schema and verify database initialization.
5. Implement registration and login with password hashing and JWT.
6. Implement authentication middleware and protect every task CRUD route.
7. Implement validation and consistent error handling.
8. Test the endpoints. Add automated tests if practical, especially for authentication and user data isolation.
9. Run the project and fix errors. Do not claim tests passed unless they were actually run.
10. Write the README based on the real implementation.
11. Review the final code for security issues, missing validation, incorrect status codes, and accidental secret files.
12. Do not push to GitHub, create a remote repository, or publish anything without the user's explicit approval.

### Important coding rules

- Keep the code beginner-friendly and readable.
- Use clear variable and function names.
- Add short comments where logic may be confusing.
- Avoid duplicate code.
- Never hardcode secrets.
- Never store plain-text passwords.
- Never allow users to access another user's tasks.
- Do not silently omit a requirement. Explain any limitation and ask before changing the agreed stack or scope.
- After implementation, provide the user with:
  - A summary of what was built.
  - The exact commands to install and run it.
  - The API endpoint list.
  - The tests actually executed and their results.
  - Any remaining work required before GitHub submission.

## 14. Definition of Done

The project is complete only when:

- Registration and login work.
- Passwords are securely hashed.
- Login returns a valid JWT.
- Every task CRUD endpoint requires authentication.
- Each user can access only their own tasks.
- Write endpoints validate inputs.
- Correct HTTP status codes and clear JSON errors are returned.
- SQLite data persists after restarting the server.
- README documents every implemented endpoint accurately.
- The application starts successfully from a fresh setup.
- The Postman testing checklist has been completed.
- The public GitHub repository is ready for submission.
