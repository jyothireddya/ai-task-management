// NOTE: This app runs entirely in the browser with no backend.
// Passwords are hashed client-side with djb2 for demo purposes only.
// Do not use this approach for a production system.

function hashPassword(password) {
    let hash = 5381;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) + hash) + password.charCodeAt(i);
        hash = hash & hash;
    }
    return hash.toString(16);
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem("users")) || {};
    } catch (e) {
        return {};
    }
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return localStorage.getItem("currentUser") || null;
}

function isAuthenticated() {
    return !!getCurrentUser();
}

function registerUser(username, password) {
    if (!username || username.trim().length < 3) {
        return { success: false, error: "Username must be at least 3 characters." };
    }
    if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters." };
    }

    const key = username.trim().toLowerCase();
    const users = getUsers();

    if (users[key]) {
        return { success: false, error: "Username already taken." };
    }

    users[key] = {
        username: key,
        displayName: username.trim(),
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
    };

    saveUsers(users);
    return { success: true };
}

function loginUser(username, password) {
    if (!username || !password) {
        return { success: false, error: "Username and password are required." };
    }

    const key = username.trim().toLowerCase();
    const users = getUsers();
    const user = users[key];

    if (!user || user.passwordHash !== hashPassword(password)) {
        return { success: false, error: "Invalid username or password." };
    }

    localStorage.setItem("currentUser", key);
    return { success: true, username: key, displayName: user.displayName };
}

function logoutUser() {
    localStorage.removeItem("currentUser");
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// CommonJS export for test environments
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        hashPassword,
        getUsers,
        saveUsers,
        getCurrentUser,
        isAuthenticated,
        registerUser,
        loginUser,
        logoutUser
    };
}
