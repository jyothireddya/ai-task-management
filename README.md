# AI Task Management

A browser-based task management application with per-user task isolation.

## Features

### User Authentication (EPMEDUAI)
- Register an account with a username and password
- Sign in and sign out
- Each user's tasks are stored separately
- Unauthenticated users are redirected to the login page
- Input validation with clear error messages

### Task Management
- Create tasks with a title, description, and status
- View all tasks or filter by status
- Delete tasks
- Tasks persisted in browser `localStorage` (per user)

## Task Statuses

| Value | Label |
|---|---|
| `TODO` | To Do |
| `IN_PROGRESS` | In Progress |
| `DONE` | Done |

## Technology

- HTML5, CSS3, vanilla JavaScript
- Browser `localStorage` for persistence (no backend required)
- Jest + jsdom for automated tests

## How to Run Locally

No build step or server is required.

1. Clone the repository:
   ```
   git clone https://github.com/jyothireddya/ai-task-management.git
   cd ai-task-management
   ```

2. Open `login.html` in a web browser (double-click or use a local server):
   ```
   # macOS / Linux
   open login.html

   # Windows
   start login.html

   # Or with a local server (e.g. VS Code Live Server, or Python):
   python -m http.server 8080
   # then open http://localhost:8080/login.html
   ```

3. Register a new account, then sign in to manage tasks.

## Running Tests

```
npm install
npm test
```

The test suite covers:
- Password hashing consistency
- User registration (success, duplicate username, short username, short password)
- Login (success, wrong password, unknown user, case-insensitive username)
- Logout and session clearing
- Authentication state checks
- Task status formatting and HTML escaping
- Per-user storage key generation

## File Structure

```
ai-task-management/
├── login.html       # Login / Register page (entry point)
├── index.html       # Main task management page
├── auth.js          # Authentication logic
├── app.js           # Task management logic
├── style.css        # All styles
├── package.json     # npm / Jest configuration
├── tests/
│   ├── auth.test.js # Auth unit tests
│   └── app.test.js  # App unit tests
└── README.md
```

## Security Notes

This application runs entirely in the browser with no backend.
Passwords are hashed with a client-side algorithm for demo purposes only.
**Do not use this for storing sensitive data in a production environment.**

## Limitations & Future Improvements

- Task priority and due dates
- Full-text search
- Task editing
- Backend API with server-side authentication (e.g. JWT / OAuth)
- Database persistence
