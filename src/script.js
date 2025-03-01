import { Signal } from "signal-polyfill";
import { effect } from "./effect";
import { createTask, makeTask, createSubtask } from "./tasks";
import { renderTask } from "./rendering";

document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const taskMap = new Map(); // Maps task IDs to DOM elements

    let dragStartIndex = null;

    localStorage.clear()

    const getTasks = JSON.parse(localStorage.getItem("tasks")) || []

    const tasks = new Signal.State(getTasks.map(task => makeTask(task.id, task.text, task.subtasks)))

    effect(() => {
        const currentTasks = tasks.get();
        /* console.log(currentTasks) */

        localStorage.setItem("tasks", JSON.stringify(tasks.get()));

        const currentIds = new Set(currentTasks.map(t => t.id));

        // Remove deleted tasks
        Array.from(taskMap.keys()).forEach(taskId => {
            if (!currentIds.has(taskId)) {
                taskMap.get(taskId).element.remove();
                taskMap.delete(taskId);
            }
        });

        // Add/update existing tasks
        currentTasks.forEach((task, index) => {
            let entry = taskMap.get(task.id);
            
            if (!entry) {

                // New task
                entry = renderTask(task, taskList);
                /* entry = { taskItem, addSubtaskButton, deleteButton }; */

                taskMap.set(task.id, entry);
                
                entry.addSubtaskButton.addEventListener('click', () => {
                    const text = prompt('Enter subtask:');
                    if (text) {
                        task.subtasks.set([...task.subtasks.get(), createSubtask(text)]);
                    }
                });

                entry.deleteButton.addEventListener('click', () => {
                    tasks.set(tasks.get().filter(t => t.id !== task.id));
                });

                // Drag and drop handlers
                entry.taskItem.addEventListener('dragstart', () => {
                    entry.taskItem.classList.add('dragging');
                    dragStartIndex = index;
                });

                entry.taskItem.addEventListener('dragend', () => {
                    entry.taskItem.classList.remove('dragging');
                    dragStartIndex = null;
                });
            }

            // Update DOM order if needed
            const currentElement = entry.taskItem;
            const correctPosition = index === 0 
                ? taskList.firstChild 
                : taskMap.get(currentTasks[index - 1].id).element.nextSibling;

            if (currentElement !== correctPosition) {
                taskList.insertBefore(currentElement, correctPosition);
            }
        });
    });

    addTaskButton.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        if (taskText === "") return;    // No input, don't do anything

        tasks.set([...tasks.get(), createTask(taskText)]);
        taskInput.value = "";
    });
});