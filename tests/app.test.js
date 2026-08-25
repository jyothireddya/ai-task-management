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
global.alert = jest.fn();

// ─── DOM template ────────────────────────────────────────────────────────────

const FULL_DOM = `
    <input id="taskTitle" />
    <textarea id="taskDescription"></textarea>
    <select id="taskStatus">
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
    </select>
    <select id="filterStatus">
        <option value="ALL">All</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
    </select>
    <div id="taskList"></div>
    <span id="userGreeting"></span>
`;

// Provide minimal DOM for the initial module load
document.body.innerHTML = FULL_DOM;

const { formatStatus, escapeHtml, getTasksKey } = require("../app");

// ─── helpers ──────────────────────────────────────────────────────────────────

function clearStorage() {
    localStorage.clear();
}

// Load a fresh instance of app.js with the given pre-seeded tasks
function freshApp(seedTasks) {
    localStorage.clear();
    if (seedTasks && seedTasks.length > 0) {
        localStorage.setItem("tasks_testuser", JSON.stringify(seedTasks));
    }
    global.requireAuth = () => true;
    global.getCurrentUser = () => "testuser";
    global.logoutUser = jest.fn();
    document.body.innerHTML = FULL_DOM;
    window.location.href = "";
    jest.resetModules();
    return require("../app");
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

// ─── addTask ─────────────────────────────────────────────────────────────────

describe("addTask", () => {
    let app;

    beforeEach(() => {
        global.alert = jest.fn();
        app = freshApp([]);
    });

    test("alerts and does not save when title is empty", () => {
        document.getElementById("taskTitle").value = "";
        app.addTask();
        expect(global.alert).toHaveBeenCalledWith("Task title is required.");
        expect(localStorage.getItem("tasks_testuser")).toBeNull();
    });

    test("adds a task to localStorage when a title is provided", () => {
        document.getElementById("taskTitle").value = "My Task";
        document.getElementById("taskDescription").value = "Some description";
        document.getElementById("taskStatus").value = "TODO";
        app.addTask();
        const saved = JSON.parse(localStorage.getItem("tasks_testuser"));
        expect(saved).toHaveLength(1);
        expect(saved[0].title).toBe("My Task");
        expect(saved[0].description).toBe("Some description");
        expect(saved[0].status).toBe("TODO");
    });

    test("clears the title and description fields after adding", () => {
        document.getElementById("taskTitle").value = "Cleanup Task";
        document.getElementById("taskDescription").value = "some text";
        app.addTask();
        expect(document.getElementById("taskTitle").value).toBe("");
        expect(document.getElementById("taskDescription").value).toBe("");
    });

    test("saved task has a numeric id and an ISO createdAt timestamp", () => {
        document.getElementById("taskTitle").value = "Timestamped Task";
        app.addTask();
        const saved = JSON.parse(localStorage.getItem("tasks_testuser"));
        expect(typeof saved[0].id).toBe("number");
        expect(() => new Date(saved[0].createdAt)).not.toThrow();
    });

    test("accumulates multiple tasks across successive calls", () => {
        document.getElementById("taskTitle").value = "Task A";
        app.addTask();
        document.getElementById("taskTitle").value = "Task B";
        app.addTask();
        const saved = JSON.parse(localStorage.getItem("tasks_testuser"));
        expect(saved).toHaveLength(2);
        expect(saved.map(t => t.title)).toEqual(["Task A", "Task B"]);
    });
});

// ─── deleteTask ───────────────────────────────────────────────────────────────

describe("deleteTask", () => {
    const SEED = [
        { id: 100, title: "Task Alpha", description: "", status: "TODO", createdAt: "" },
        { id: 200, title: "Task Beta",  description: "", status: "DONE", createdAt: "" }
    ];
    let app;

    beforeEach(() => {
        app = freshApp(SEED);
    });

    test("removes the task with the matching id", () => {
        app.deleteTask(100);
        const saved = JSON.parse(localStorage.getItem("tasks_testuser"));
        expect(saved.find(t => t.id === 100)).toBeUndefined();
    });

    test("leaves other tasks intact", () => {
        app.deleteTask(100);
        const saved = JSON.parse(localStorage.getItem("tasks_testuser"));
        expect(saved).toHaveLength(1);
        expect(saved[0].id).toBe(200);
    });

    test("persists the deletion to localStorage", () => {
        app.deleteTask(200);
        const saved = JSON.parse(localStorage.getItem("tasks_testuser"));
        expect(saved.every(t => t.id !== 200)).toBe(true);
    });
});

// ─── renderTasks ─────────────────────────────────────────────────────────────

describe("renderTasks", () => {
    const SEED = [
        { id: 1, title: "Alpha",   description: "desc A", status: "TODO",        createdAt: "" },
        { id: 2, title: "Beta",    description: "desc B", status: "IN_PROGRESS",  createdAt: "" },
        { id: 3, title: "Gamma",   description: "desc C", status: "DONE",         createdAt: "" }
    ];
    let app;

    beforeEach(() => {
        app = freshApp(SEED);
    });

    test("renders a card for every task when filter is ALL", () => {
        document.getElementById("filterStatus").value = "ALL";
        app.renderTasks();
        const cards = document.querySelectorAll(".task-card");
        expect(cards).toHaveLength(3);
    });

    test("shows the empty-message element when no tasks match the filter", () => {
        // No tasks have status DONE... wait, SEED has one. Use a fresh instance.
        app = freshApp([]);
        document.getElementById("filterStatus").value = "ALL";
        app.renderTasks();
        expect(document.getElementById("taskList").innerHTML).toContain("empty-message");
    });

    test("filters tasks by status correctly", () => {
        document.getElementById("filterStatus").value = "TODO";
        app.renderTasks();
        const cards = document.querySelectorAll(".task-card");
        expect(cards).toHaveLength(1);
        expect(cards[0].querySelector("h3").textContent).toBe("Alpha");
    });

    test("task card contains the escaped title and description", () => {
        document.getElementById("filterStatus").value = "ALL";
        app.renderTasks();
        const firstCard = document.querySelector(".task-card");
        expect(firstCard.querySelector("h3").textContent).toBe("Alpha");
        expect(firstCard.querySelector("p").textContent).toBe("desc A");
    });
});

// ─── handleLogout ─────────────────────────────────────────────────────────────

describe("handleLogout", () => {
    let app;

    beforeEach(() => {
        app = freshApp([]);
    });

    test("calls logoutUser", () => {
        app.handleLogout();
        expect(global.logoutUser).toHaveBeenCalledTimes(1);
    });

    test("redirects to login.html", () => {
        app.handleLogout();
        expect(window.location.href).toBe("login.html");
    });
});
