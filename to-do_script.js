document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");

    let tasks = []      // Store tasks in memory
    let draggedTask = null;

    // Load saved tasks from localStorage
    loadTasks();

    addTaskButton.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;    // No input, don't do anything

        const task = { text: taskText, subtasks: [] };
        tasks.push(task)
        updateDOM();
        saveTasks();

        taskInput.value = "";
    });

    // Bit of a blackbox function? Used throughout the page to update the DOM 
    // when a change is made or after we load from localstorage
    function updateDOM() {
        taskList.innerHTML = "";    // Clear and repopulate the displayed list => Use signals to recalc changed parts?
        tasks.forEach((task, index) => addTaskToDOM(task, index))
    }

    function addTaskToDOM(task, taskIndex) {
        const taskItem = document.createElement("li");
        taskItem.classList.add("task");
        taskItem.setAttribute("draggable", "true");
        taskItem.dataset.index = taskIndex;
        taskItem.innerHTML = `
            <div class="task-header">
                <span>${task.text}</span>
                <button class="add-subtask">Add subtask</button>
                <button class="delete-task" ${task.subtasks.length > 0 ? "disabled" : ""}>Delete</button>
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

            tasks[taskIndex].subtasks.push({ text: subtaskText, completed: false });
            updateDOM();
            saveTasks();
        });

        deleteTaskButton.addEventListener("click", function () {
            tasks.splice(taskIndex, 1);
            updateDOM();
            saveTasks();
        });

        // Add/Load all existing subtasks
        task.subtasks.forEach((subtask, subtaskIndex) => addSubtaskToDOM(subtaskList, taskIndex, subtaskIndex));

        updateDeleteButtonState(taskItem, taskIndex);
    }

    function addSubtaskToDOM(subtaskList, taskIndex, subtaskIndex) {
        const subtaskData = tasks[taskIndex].subtasks[subtaskIndex];

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
            tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
            updateDOM();
            saveTasks();
        });

        checkbox.addEventListener("change", function () {
            tasks[taskIndex].subtasks[subtaskIndex].completed = checkbox.checked;
            updateDeleteButtonState(subtaskList.closest(".task"), taskIndex);
            saveTasks();
        });
    }

    function updateDeleteButtonState(taskItem, taskIndex) {
        const deleteTaskButton = taskItem.querySelector(".delete-task");
        const subtasks = tasks[taskIndex].subtasks;
        const completedSubtasks = subtasks.filter(sub => sub.completed).length;

        deleteTaskButton.disabled = subtasks.length > 0 && completedSubtasks !== subtasks.length;
    }

    // Changed to just save the stored tasks, no need to get all the tasks from the DOM
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Get stored tasks, toss them in the tasks object and use it to update DOM
    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        updateDOM();
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
            const target = e.target.closest(".task");
            if (!target || target === draggedTask) return;

            const draggedIndex = Number(draggedTask.dataset.index);
            const targetIndex = Number(target.dataset.index);

            // Swap tasks in the array
            const temp = tasks[draggedIndex];
            tasks.splice(draggedIndex, 1);
            tasks.splice(targetIndex, 0, temp);

            updateDOM();
            saveTasks();
        });
    }
});
