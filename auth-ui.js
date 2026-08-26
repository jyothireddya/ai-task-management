// UI-only demo authentication. No backend, no server, no real credential verification.
// Only a non-sensitive session marker (email address) is stored in localStorage.
// The password is never stored, logged, or sent anywhere.

const _SESSION_KEY = "ui_session";

function _validateEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function loginUI(email, password) {
    const trimmedEmail = String(email || "").trim();

    if (!trimmedEmail) {
        return { success: false, error: "Email is required." };
    }
    if (!_validateEmailFormat(trimmedEmail)) {
        return { success: false, error: "Enter a valid email address." };
    }
    if (!password || password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters." };
    }

    // Store only the non-sensitive session marker — never the password
    localStorage.setItem(_SESSION_KEY, JSON.stringify({ email: trimmedEmail.toLowerCase() }));
    return { success: true, email: trimmedEmail.toLowerCase() };
}

function logoutUI() {
    localStorage.removeItem(_SESSION_KEY);
}

function getCurrentUserEmail() {
    try {
        const raw = localStorage.getItem(_SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        return (s && s.email) ? s.email : null;
    } catch {
        return null;
    }
}

function isAuthenticated() {
    return !!getCurrentUserEmail();
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { loginUI, logoutUI, getCurrentUserEmail, isAuthenticated, requireAuth };
}
