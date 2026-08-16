let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {

    const title = document.getElementById("taskTitle").value.trim();
    const description = document
        .getElementById("taskDescription")
        .value
        .trim();

    const status = document.getElementById("taskStatus").value;

    if (!title) {
        alert("Task title is required.");
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        description: description,
        status: status,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);

    saveTasks();

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskStatus").value = "TODO";

    renderTasks();
}

function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();
}

function renderTasks() {

    const taskList = document.getElementById("taskList");
    const filter = document.getElementById("filterStatus").value;

    const filteredTasks = filter === "ALL"
        ? tasks
        : tasks.filter(task => task.status === filter);

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<div class="empty-message">No tasks found.</div>';
        return;
    }

    taskList.innerHTML = filteredTasks
        .map(task => `
            <div class="task-card">

                <h3>${escapeHtml(task.title)}</h3>

                <p>${escapeHtml(task.description || "No description")}</p>

                <span class="status status-${task.status}">
                    ${formatStatus(task.status)}
                </span>

                <br>

                <button
                    class="delete-button"
                    onclick="deleteTask(${task.id})">
                    Delete
                </button>

            </div>
        `)
        .join("");
}

function formatStatus(status) {

    const statuses = {
        TODO: "To Do",
        IN_PROGRESS: "In Progress",
        DONE: "Done"
    };

    return statuses[status] || status;
}

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}

renderTasks();
