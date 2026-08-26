/**
 * Tests for auth-ui.js — UI-only email-based login
 */

delete window.location;
window.location = { href: "" };

const {
    loginUI,
    logoutUI,
    getCurrentUserEmail,
    isAuthenticated,
    requireAuth
} = require("../auth-ui");

function clearStorage() {
    localStorage.clear();
}

// ─── loginUI — validation ────────────────────────────────────────────────────

describe("loginUI — validation", () => {
    beforeEach(clearStorage);

    test("fails when email is empty", () => {
        const r = loginUI("", "password1");
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/email is required/i);
    });

    test("fails when email is whitespace only", () => {
        const r = loginUI("   ", "password1");
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/email is required/i);
    });

    test("fails when email format is invalid", () => {
        const r = loginUI("notanemail", "password1");
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/valid email/i);
    });

    test("fails when email has no domain", () => {
        const r = loginUI("user@", "password1");
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/valid email/i);
    });

    test("fails when password is missing", () => {
        const r = loginUI("user@example.com", "");
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/6 characters/i);
    });

    test("fails when password is fewer than 6 characters", () => {
        const r = loginUI("user@example.com", "abc");
        expect(r.success).toBe(false);
        expect(r.error).toMatch(/6 characters/i);
    });

    test("succeeds with valid email and password (6 chars)", () => {
        const r = loginUI("user@example.com", "abc123");
        expect(r.success).toBe(true);
    });

    test("succeeds with valid email and long password", () => {
        const r = loginUI("alice@company.org", "superSecurePass99");
        expect(r.success).toBe(true);
        expect(r.email).toBe("alice@company.org");
    });

    test("normalises email to lowercase on success", () => {
        const r = loginUI("USER@EXAMPLE.COM", "password1");
        expect(r.success).toBe(true);
        expect(r.email).toBe("user@example.com");
    });
});

// ─── loginUI — session marker ────────────────────────────────────────────────

describe("loginUI — session marker", () => {
    beforeEach(clearStorage);

    test("stores only the email in localStorage, not the password", () => {
        loginUI("user@example.com", "s3cretPass");
        const raw = localStorage.getItem("ui_session");
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw);
        expect(parsed.email).toBe("user@example.com");
        // Password must not appear in the stored value
        expect(JSON.stringify(parsed)).not.toContain("s3cretPass");
        expect(parsed.password).toBeUndefined();
        expect(parsed.passwordHash).toBeUndefined();
    });

    test("session marker contains only the email key", () => {
        loginUI("me@test.com", "abcdef");
        const parsed = JSON.parse(localStorage.getItem("ui_session"));
        expect(Object.keys(parsed)).toEqual(["email"]);
    });
});

// ─── getCurrentUserEmail ─────────────────────────────────────────────────────

describe("getCurrentUserEmail", () => {
    beforeEach(clearStorage);

    test("returns null when no session exists", () => {
        expect(getCurrentUserEmail()).toBeNull();
    });

    test("returns the email after a successful login", () => {
        loginUI("bob@example.com", "hunter99");
        expect(getCurrentUserEmail()).toBe("bob@example.com");
    });

    test("returns null after logout", () => {
        loginUI("bob@example.com", "hunter99");
        logoutUI();
        expect(getCurrentUserEmail()).toBeNull();
    });
});

// ─── isAuthenticated ─────────────────────────────────────────────────────────

describe("isAuthenticated", () => {
    beforeEach(clearStorage);

    test("returns false when not logged in", () => {
        expect(isAuthenticated()).toBe(false);
    });

    test("returns true after a successful login", () => {
        loginUI("carol@example.com", "pass99!");
        expect(isAuthenticated()).toBe(true);
    });

    test("returns false after logout", () => {
        loginUI("carol@example.com", "pass99!");
        logoutUI();
        expect(isAuthenticated()).toBe(false);
    });
});

// ─── logoutUI ────────────────────────────────────────────────────────────────

describe("logoutUI", () => {
    beforeEach(clearStorage);

    test("clears the session marker from localStorage", () => {
        loginUI("dan@example.com", "mypass1");
        logoutUI();
        expect(localStorage.getItem("ui_session")).toBeNull();
    });

    test("is a no-op when already logged out", () => {
        expect(() => logoutUI()).not.toThrow();
    });
});

// ─── requireAuth ─────────────────────────────────────────────────────────────

describe("requireAuth", () => {
    beforeEach(() => {
        clearStorage();
        window.location.href = "";
    });

    test("redirects to login.html when not authenticated", () => {
        requireAuth();
        expect(window.location.href).toBe("login.html");
    });

    test("returns false when not authenticated", () => {
        expect(requireAuth()).toBe(false);
    });

    test("does not redirect when authenticated", () => {
        loginUI("eve@example.com", "securePass1");
        requireAuth();
        expect(window.location.href).toBe("");
    });

    test("returns true when authenticated", () => {
        loginUI("eve@example.com", "securePass1");
        expect(requireAuth()).toBe(true);
    });
});

// ─── password clearing — login form DOM behaviour ────────────────────────────

describe("password clearing on login attempt", () => {
    beforeEach(() => {
        clearStorage();
        // Set up a minimal login form in jsdom
        document.body.innerHTML = `
            <input id="loginEmail" type="email" />
            <input id="loginPassword" type="password" />
            <div id="loginError" class="auth-error"></div>
        `;
        window.location.href = "";
    });

    // Mirrors the handleLogin logic in login.html
    function handleLogin(email, password) {
        document.getElementById("loginEmail").value = email;
        document.getElementById("loginPassword").value = password;

        // Simulate submit: read fields, clear password, attempt login
        const emailVal = document.getElementById("loginEmail").value;
        const pwdVal = document.getElementById("loginPassword").value;
        document.getElementById("loginPassword").value = "";    // always clear

        const result = loginUI(emailVal, pwdVal);

        if (!result.success) {
            document.getElementById("loginError").textContent = result.error;
            return result;
        }

        window.location.href = "index.html";
        return result;
    }

    test("clears the password field after a failed login attempt", () => {
        handleLogin("bad-email", "short");
        expect(document.getElementById("loginPassword").value).toBe("");
    });

    test("clears the password field after a successful login attempt", () => {
        handleLogin("user@example.com", "correctPass1");
        expect(document.getElementById("loginPassword").value).toBe("");
    });

    test("shows inline error when email is invalid", () => {
        handleLogin("notanemail", "password1");
        expect(document.getElementById("loginError").textContent).toMatch(/valid email/i);
    });

    test("shows inline error when password is too short", () => {
        handleLogin("user@example.com", "abc");
        expect(document.getElementById("loginError").textContent).toMatch(/6 characters/i);
    });

    test("redirects to index.html on successful login", () => {
        handleLogin("user@example.com", "correctPass1");
        expect(window.location.href).toBe("index.html");
    });
});

// ─── task UI gating ──────────────────────────────────────────────────────────

describe("task UI gating via requireAuth", () => {
    beforeEach(() => {
        clearStorage();
        window.location.href = "";
    });

    test("unauthenticated access redirects to login.html", () => {
        requireAuth();
        expect(window.location.href).toBe("login.html");
    });

    test("authenticated access does not redirect", () => {
        loginUI("user@example.com", "password1");
        requireAuth();
        expect(window.location.href).toBe("");
    });
});
