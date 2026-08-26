# AI Task Management

A browser-based task management application with a UI-only demo login.

## ⚠️ Security Notice

**This application uses demo / client-side authentication only.**
- Any valid email format and password (6+ characters) will work.
- No credentials are stored or verified against a backend.
- Only the email address is saved as a session marker in `localStorage`.
- The password is **never** stored, hashed, or logged anywhere.
- **Do not use this for storing sensitive data or in a production environment.**

---

## Features

### UI-Only Login

- Email and password form with client-side validation
- Inline error messages for invalid input (bad email format, short password)
- Task UI is gated — unauthenticated visitors are redirected to the login page
- Logout button clears the session and redirects to the login page
- Password field is always cleared after every login attempt (success or failure)
- Only a non-sensitive session marker (email) is stored in `localStorage`

### Task Management

- Create tasks with a title, description, and status
- View all tasks or filter by status
- Delete tasks
- Tasks are stored per-user in browser `localStorage`
- All rendered content is XSS-protected via `escapeHtml()`

## Task Statuses

| Value | Label |
|---|---|
| `TODO` | To Do |
| `IN_PROGRESS` | In Progress |
| `DONE` | Done |

## Technology

- HTML5, CSS3, vanilla JavaScript — no build step, no bundler
- Browser `localStorage` for persistence (no backend required)
- Jest + jsdom for automated tests

## How to Run Locally

No build step or server is required.

1. Clone the repository:
   ```
   git clone https://github.com/jyothireddya/ai-task-management.git
   cd ai-task-management
   ```

2. Open `login.html` in a web browser:
   ```
   # macOS / Linux
   open login.html

   # Windows
   start login.html

   # Or with a local server (Python):
   python -m http.server 8080
   # then open http://localhost:8080/login.html
   ```

3. Enter any valid email (e.g. `demo@example.com`) and any password 6+ characters long. Click **Login**.

4. You will be taken to the task management page. Use the **Sign Out** button to log out.

## How the UI-Only Login Works

The login is entirely client-side with no real credential verification:

1. The login form validates that the email field contains a properly formatted email address and that the password is at least 6 characters long.
2. If validation passes, a session marker `{ email: "..." }` is written to `localStorage` under the key `ui_session`.
3. The password is **immediately discarded** — it is cleared from the input field and never written to storage.
4. `index.html` checks for the session marker on load. If it is absent, the user is redirected to `login.html`.
5. Clicking **Sign Out** removes the session marker and redirects to the login page.

## Running Tests

```
npm install
npm test
```

The test suite covers:
- Email format validation (empty, whitespace, bad format)
- Password length validation
- Session marker contents (only email stored, no password)
- `isAuthenticated` state before and after login/logout
- `requireAuth` redirect behaviour
- Password field clearing after every login attempt
- Inline error message display
- Task status formatting and HTML escaping (`escapeHtml`)
- Per-user storage key generation
- `addTask`, `deleteTask`, `renderTasks`, `handleLogout`

## File Structure

```
ai-task-management/
├── login.html        # Login page (entry point)
├── index.html        # Task management page
├── auth-ui.js        # UI-only auth logic (session marker, validation)
├── auth.js           # Original username-based auth module (preserved)
├── app.js            # Task management logic
├── style.css         # All styles
├── package.json      # npm / Jest configuration
├── tests/
│   ├── login-ui.test.js   # Tests for auth-ui.js and login behaviour
│   ├── app.test.js        # Tests for app.js task logic
│   └── auth.test.js       # Tests for the original auth.js module
└── README.md
```

## Limitations

- No real authentication — any email + 6-char password logs you in.
- Data is stored only in the browser; clearing `localStorage` removes all tasks.
- No task editing or priority fields.
- No server-side persistence.
