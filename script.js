
/* =========================
   1. SELECT HTML ELEMENTS
========================= */

const todoForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const remainingCount = document.getElementById("remaining-count");
const totalCount = document.getElementById("total-count");
const emptyMessage = document.getElementById("empty-message");
const clearCompletedButton = document.getElementById("clear-completed");
const formMessage = document.getElementById("form-message");

/* =========================
   2. LOAD SAVED TASKS
========================= */

let tasks = [];

try {
    const savedTasks = localStorage.getItem("taskflow-tasks");
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (
        Array.isArray(parsedTasks) &&
        parsedTasks.every(
            task =>
                task !== null &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean"
        )
    ) {
        tasks = parsedTasks;
    }
} catch (error) {
    console.warn("Saved tasks could not be loaded.", error);
}

/* =========================
   3. SAVE TASKS
========================= */

function saveTasks() {
    try {
        localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (error) {
        formMessage.textContent =
            "Your browser could not save tasks. Check browser storage settings.";
    }
}

/* =========================
   4. UPDATE TASK COUNTERS
========================= */

function updateCounters() {
    const remainingTasks = tasks.filter(
        task => !task.completed
    ).length;

    remainingCount.textContent = remainingTasks;

    totalCount.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

    emptyMessage.hidden = tasks.length > 0;
}

/* =========================
   5. DISPLAY TASKS
========================= */

function renderTasks() {
    taskList.replaceChildren();

    tasks.forEach(task => {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete task: ${task.text}`
        );

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);
            saveTasks();
            renderTasks();
        });

        listItem.append(checkbox, taskText, deleteButton);
        taskList.appendChild(listItem);
    });

    updateCounters();
}

/* =========================
   6. ADD A NEW TASK
========================= */

todoForm.addEventListener("submit", event => {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (!taskText) {
        formMessage.textContent = "Please enter a task first.";
        taskInput.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    formMessage.textContent = "";
    taskInput.focus();
});

/* =========================
   7. CLEAR COMPLETED TASKS
========================= */

clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
});

/* =========================
   8. INITIAL DISPLAY
========================= */

renderTasks();
