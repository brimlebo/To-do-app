document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");

    let draggedTask = null;

    // Load saved tasks from localStorage
    loadTasks();

    addTaskButton.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;

        const taskData = { text: taskText, subtasks: [] };
        addTaskToDOM(taskData);
        saveTasks();

        taskInput.value = "";
    });

    function addTaskToDOM(taskData) {
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        taskItem.setAttribute("draggable", "true");
        taskItem.innerHTML = `
            <div class="task-header">
                <span>${taskData.text}</span>
                <button class="add-subtask">Add subtask</button>
                <button class="delete-task" disabled>Delete</button>
            </div>
            <ul class="subtask-list"></ul>
        `;

        taskList.appendChild(taskItem);
        addDragAndDrop(taskItem);

        const subtaskList = taskItem.querySelector(".subtask-list");
        const addSubtaskButton = taskItem.querySelector(".add-subtask");
        const deleteTaskButton = taskItem.querySelector(".delete-task");

        addSubtaskButton.addEventListener("click", function () {
            const subtaskText = prompt("Enter subtask:");
            if (!subtaskText) return;

            const subtaskData = { text: subtaskText, completed: false };
            addSubtaskToDOM(subtaskList, subtaskData);
            updateDeleteButtonState(taskItem);
            saveTasks();
        });

        deleteTaskButton.addEventListener("click", function () {
            taskItem.remove();
            saveTasks();
        });

        // Load existing subtasks
        taskData.subtasks.forEach(subtask => addSubtaskToDOM(subtaskList, subtask));

        updateDeleteButtonState(taskItem);
    }

    function addSubtaskToDOM(subtaskList, subtaskData) {
        const subtaskItem = document.createElement("li");
        subtaskItem.innerHTML = `
            <input type="checkbox" ${subtaskData.completed ? "checked" : ""}>
            <span>${subtaskData.text}</span>
            <button class="delete-subtask">Delete</button>
        `;
        subtaskList.appendChild(subtaskItem);

        const deleteSubtaskButton = subtaskItem.querySelector(".delete-subtask");
        const checkbox = subtaskItem.querySelector("input");

        deleteSubtaskButton.addEventListener("click", function () {
            subtaskItem.remove();
            updateDeleteButtonState(subtaskList.closest(".task"));
            saveTasks();
        });

        checkbox.addEventListener("change", function () {
            updateDeleteButtonState(subtaskList.closest(".task"));
            saveTasks();
        });
    }

    function updateDeleteButtonState(taskItem) {
        const subtaskList = taskItem.querySelector(".subtask-list");
        const deleteTaskButton = taskItem.querySelector(".delete-task");

        const subtasks = subtaskList.querySelectorAll("li");
        const completedSubtasks = subtaskList.querySelectorAll("input:checked");

        deleteTaskButton.disabled = subtasks.length > 0 && completedSubtasks.length !== subtasks.length;
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll(".task").forEach(taskItem => {
            const taskText = taskItem.querySelector(".task-header span").innerText;
            const subtasks = [];

            taskItem.querySelectorAll(".subtask-list li").forEach(subtaskItem => {
                subtasks.push({
                    text: subtaskItem.querySelector("span").innerText,
                    completed: subtaskItem.querySelector("input").checked
                });
            });

            tasks.push({ text: taskText, subtasks });
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
        savedTasks.forEach(taskData => addTaskToDOM(taskData));
    }

    function addDragAndDrop(taskItem) {
        taskItem.addEventListener("dragstart", function () {
            draggedTask = this;
            this.style.opacity = "0.5";
        });

        taskItem.addEventListener("dragend", function () {
            draggedTask = null;
            this.style.opacity = "1";
            saveTasks(); // Save new order
        });

        taskItem.addEventListener("dragover", function (e) {
            e.preventDefault();
            const bounding = this.getBoundingClientRect();
            const offset = e.clientY - bounding.top;
            if (offset > bounding.height / 2) {
                this.parentNode.insertBefore(draggedTask, this.nextSibling);
            } else {
                this.parentNode.insertBefore(draggedTask, this);
            }
        });
    }
});
