import { effect } from "./effect";

export function renderTask(task, container) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task");
    taskItem.draggable = true;

    taskItem.innerHTML = `
        <div class="task-header">
            <span class="task-text"></span>
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
        renderSubtasks(task.subtasks.get(), subtaskList)
    });

    container.appendChild(taskItem)
    return { taskItem, addSubtaskButton, deleteButton }
}

function renderSubtasks(subtasks, container) {
    const currentIds = new Set(subtasks.map(subtask => subtask.id));
    const existing = Array.from(container.children);

    existing.forEach(item => {
        if (!currentIds.has(item.dataset.id)) {
            item._effects?.forEach(fn => fn());
            item.remove();
        }
    });

    subtasks.forEach(subtask => {
        let item = container.querySelector(`[data-id="${subtask.id}"]`);
        if (!item) {
            item = document.createElement('li');
            item.dataset.id = subtask.id;
            item.innerHTML = `
                <input type="checkbox">
                <span class="subtask-text"></span>
                <button class="delete-subtask">Delete</button>
            `;
            
            // Add effects for reactivity
            item._effects = [
                effect(() => {
                    item.querySelector('.subtask-text').textContent = subtask.text.get();
                }),
                effect(() => {
                    item.querySelector('input').checked = subtask.completed.get();
                })
            ];
            
            // Add event handlers
            item.querySelector('input').addEventListener('change', () => {
                subtask.completed.set(!subtask.completed.get());
            });
            
            container.appendChild(item);
        }
    });
}