/**
 * Tests for auth.js — User Login feature (EPMEDUAI)
 */

// auth.js uses localStorage and window.location; jsdom provides localStorage.
// We stub window.location to prevent actual navigation.
delete window.location;
window.location = { href: "" };

const {
    hashPassword,
    getUsers,
    saveUsers,
    getCurrentUser,
    isAuthenticated,
    registerUser,
    loginUser,
    logoutUser
} = require("../auth");

// ─── helpers ──────────────────────────────────────────────────────────────────

function clearStorage() {
    localStorage.clear();
}

// ─── hashPassword ─────────────────────────────────────────────────────────────

describe("hashPassword", () => {
    test("returns a non-empty string", () => {
        expect(typeof hashPassword("secret")).toBe("string");
        expect(hashPassword("secret").length).toBeGreaterThan(0);
    });

    test("same input produces same hash", () => {
        expect(hashPassword("mypassword")).toBe(hashPassword("mypassword"));
    });

    test("different inputs produce different hashes", () => {
        expect(hashPassword("password1")).not.toBe(hashPassword("password2"));
    });
});

// ─── registerUser ─────────────────────────────────────────────────────────────

describe("registerUser", () => {
    beforeEach(clearStorage);

    test("registers a new user successfully", () => {
        const result = registerUser("Alice", "password123");
        expect(result.success).toBe(true);
    });

    test("stores the user in localStorage", () => {
        registerUser("Bob", "secret99");
        const users = getUsers();
        expect(users["bob"]).toBeDefined();
        expect(users["bob"].displayName).toBe("Bob");
    });

    test("stores a hashed password, not plain text", () => {
        registerUser("Carol", "pass1234");
        const users = getUsers();
        expect(users["carol"].passwordHash).not.toBe("pass1234");
    });

    test("fails when username is too short (< 3 chars)", () => {
        const result = registerUser("ab", "password123");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/3 characters/i);
    });

    test("fails when username is empty", () => {
        const result = registerUser("", "password123");
        expect(result.success).toBe(false);
    });

    test("fails when password is too short (< 6 chars)", () => {
        const result = registerUser("Dave", "123");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/6 characters/i);
    });

    test("fails when username already exists", () => {
        registerUser("Eve", "password123");
        const result = registerUser("Eve", "different99");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/already taken/i);
    });

    test("usernames are case-insensitive (stored lowercase)", () => {
        registerUser("Frank", "password123");
        const result = registerUser("FRANK", "other1234");
        expect(result.success).toBe(false);
    });
});

// ─── loginUser ────────────────────────────────────────────────────────────────

describe("loginUser", () => {
    beforeEach(() => {
        clearStorage();
        registerUser("Grace", "hunter99");
    });

    test("logs in with correct credentials", () => {
        const result = loginUser("Grace", "hunter99");
        expect(result.success).toBe(true);
    });

    test("sets currentUser in localStorage on success", () => {
        loginUser("Grace", "hunter99");
        expect(getCurrentUser()).toBe("grace");
    });

    test("fails with wrong password", () => {
        const result = loginUser("Grace", "wrongpass");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/invalid/i);
    });

    test("fails with unknown username", () => {
        const result = loginUser("Nobody", "hunter99");
        expect(result.success).toBe(false);
    });

    test("fails when username is missing", () => {
        const result = loginUser("", "hunter99");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/required/i);
    });

    test("fails when password is missing", () => {
        const result = loginUser("Grace", "");
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/required/i);
    });

    test("is case-insensitive for username", () => {
        const result = loginUser("GRACE", "hunter99");
        expect(result.success).toBe(true);
    });
});

// ─── logoutUser ───────────────────────────────────────────────────────────────

describe("logoutUser", () => {
    beforeEach(() => {
        clearStorage();
        registerUser("Heidi", "pass1234");
        loginUser("Heidi", "pass1234");
    });

    test("clears the current session", () => {
        expect(isAuthenticated()).toBe(true);
        logoutUser();
        expect(isAuthenticated()).toBe(false);
    });

    test("getCurrentUser returns null after logout", () => {
        logoutUser();
        expect(getCurrentUser()).toBeNull();
    });
});

// ─── isAuthenticated ──────────────────────────────────────────────────────────

describe("isAuthenticated", () => {
    beforeEach(clearStorage);

    test("returns false when no user is logged in", () => {
        expect(isAuthenticated()).toBe(false);
    });

    test("returns true after a successful login", () => {
        registerUser("Ivan", "secure99");
        loginUser("Ivan", "secure99");
        expect(isAuthenticated()).toBe(true);
    });
});
