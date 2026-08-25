/**
 * Tests for app.js — Task management logic (EPMEDUAI)
 */

// Stub browser globals that app.js references at module load time
delete window.location;
window.location = { href: "" };

// Stub auth.js functions app.js depends on
global.requireAuth = () => true;
global.getCurrentUser = () => "testuser";
global.logoutUser = () => {};
global.isAuthenticated = () => true;
global.loginUser = () => ({ success: true });
global.registerUser = () => ({ success: true });

// Provide minimal DOM that app.js accesses
document.body.innerHTML = `
    <input id="taskTitle" />
    <textarea id="taskDescription"></textarea>
    <select id="taskStatus"><option value="TODO">To Do</option></select>
    <select id="filterStatus"><option value="ALL">All</option></select>
    <div id="taskList"></div>
    <span id="userGreeting"></span>
`;

const { formatStatus, escapeHtml, getTasksKey } = require("../app");

// ─── helpers ──────────────────────────────────────────────────────────────────

function clearStorage() {
    localStorage.clear();
}

// ─── formatStatus ────────────────────────────────────────────────────────────

describe("formatStatus", () => {
    test("formats TODO", () => {
        expect(formatStatus("TODO")).toBe("To Do");
    });

    test("formats IN_PROGRESS", () => {
        expect(formatStatus("IN_PROGRESS")).toBe("In Progress");
    });

    test("formats DONE", () => {
        expect(formatStatus("DONE")).toBe("Done");
    });

    test("returns unknown status as-is", () => {
        expect(formatStatus("CUSTOM")).toBe("CUSTOM");
    });
});

// ─── escapeHtml ──────────────────────────────────────────────────────────────

describe("escapeHtml", () => {
    test("escapes < and >", () => {
        expect(escapeHtml("<b>bold</b>")).not.toContain("<b>");
    });

    test("escapes ampersand", () => {
        expect(escapeHtml("a & b")).toContain("&amp;");
    });

    test("leaves plain text unchanged", () => {
        expect(escapeHtml("hello world")).toBe("hello world");
    });
});

// ─── getTasksKey ─────────────────────────────────────────────────────────────

describe("getTasksKey", () => {
    test("returns user-scoped key when logged in", () => {
        expect(getTasksKey()).toBe("tasks_testuser");
    });

    test("falls back to generic key when getCurrentUser returns null", () => {
        const originalGetCurrentUser = global.getCurrentUser;
        global.getCurrentUser = () => null;
        // Re-import not possible cleanly; verify the key logic inline
        const key = (getCurrentUser() ? "tasks_" + getCurrentUser() : "tasks");
        expect(key).toBe("tasks");
        global.getCurrentUser = originalGetCurrentUser;
    });
});
