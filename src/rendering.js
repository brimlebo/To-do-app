import { effect } from "./effect";

export function renderTask(task, container) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task");
    taskItem.draggable = true;

    taskItem.innerHTML = `
        <div class="task-header">
            <span class="task-text">${task.text.get()}</span>
            <button class="add-subtask">Add subtask</button>
            <button class="delete-task">Delete</button>
        </div>
        <ul class="subtask-list"></ul>
    `;

    const addSubtaskButton = taskItem.querySelector(".add-subtask");
    const deleteButton = taskItem.querySelector('.delete-task');

    effect(() => {
        taskItem.querySelector('.task-text').textContent = task.text.get()
    });

    effect(() => {
        deleteButton.disabled = !task.canDelete.get();
    });

    const subtaskList = taskItem.querySelector(".subtask-list");
    effect(() => {
        renderSubtasks(task.subtasks, subtaskList)
    });

    container.appendChild(taskItem)
    return { taskItem, addSubtaskButton, deleteButton }
}

function renderSubtasks(subtasks, container) {
    const currentIds = new Set(subtasks.get().map(subtask => subtask.id));
    const existing = Array.from(container.children);

    existing.forEach(item => {
        if (!currentIds.has(item.dataset.id)) {
            item.remove();
        }
    });

    subtasks.get().forEach(subtask => {
        let item = container.querySelector(`[data-id="${subtask.id}"]`);
        if (!item) {
            item = document.createElement('li');
            item.dataset.id = subtask.id;
            item.innerHTML = `
                <input type="checkbox" ${subtask.completed.get() ? "checked" : ""}>
                <span class="subtask-text">${subtask.text}</span>
                <button class="delete-subtask">Delete</button>
            `;
            
            // Add event handlers
            item.querySelector('input').addEventListener('change', () => {
                subtask.completed.set(!subtask.completed.get());
            });

            item.querySelector('.delete-subtask').addEventListener('click', () => {
                subtasks.set(subtasks.get().filter(s => s.id !== subtask.id));
            });
            
            container.appendChild(item);
        }
    });
}