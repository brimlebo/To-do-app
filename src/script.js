import { Signal } from "signal-polyfill";
import { effect } from "./effect";
import { createTask, makeTask, createSubtask } from "./tasks";
import { renderTask } from "./rendering";

document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");
    const taskMap = new Map(); // Maps task IDs to DOM elements

    let draggedTask = null;

    // For tetsing and resetting current storage
    /* localStorage.clear() */

    const getTasks = JSON.parse(localStorage.getItem("tasks")) || []

    const tasks = new Signal.State(getTasks.map(task => makeTask(task.id, task.text, task.subtasks)))

    effect(() => {
        const currentTasks = tasks.get();
        /* console.log(currentTasks) */

        localStorage.setItem("tasks", JSON.stringify(tasks.get().map(task => ({
            id: task.id,
            text: task.text.get(),
            subtasks: task.subtasks.get().map(subtask => ({
                id: subtask.id,
                text: subtask.text,
                completed: subtask.completed.get()
            }))
        }))));

        const currentIds = new Set(currentTasks.map(t => t.id));

        // Remove deleted tasks
        Array.from(taskMap.keys()).forEach(taskId => {
            if (!currentIds.has(taskId)) {
                taskMap.get(taskId).taskItem.remove();
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
                entry.taskItem.addEventListener('dragstart', (e) => {
                    draggedTask = entry.taskItem;
                    draggedTask.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });

                entry.taskItem.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (!draggedTask || draggedTask === entry.taskItem) return;

                    const bounding = entry.taskItem.getBoundingClientRect();
                    const offset = e.clientY - bounding.top;
                    if (offset > bounding.height / 2) {
                        taskList.insertBefore(draggedTask, entry.taskItem.nextSibling);
                    } 
                    else {
                        taskList.insertBefore(draggedTask, entry.taskItem);
                    }
                });

                entry.taskItem.addEventListener('dragend', () => {
                    if (!draggedTask) return;
                    
                    draggedTask.classList.remove('dragging');

                    const domOrder = Array.from(taskList.children)
                        .map(task => task.dataset.taskId)   // Find all tasks in DOM
                        .map(taskId => tasks.get().find(t => t.id === taskId))  // Check if task is supposed to be there
                        .filter(t => t)     // Returns the order of tasks in the DOM

                    tasks.set(domOrder)

                    draggedTask = null
                });
            }

            // Update DOM order if needed
            const currentElement = entry.taskItem;
            const correctPosition = index === 0 
                ? taskList.firstChild 
                : taskMap.get(currentTasks[index - 1].id).taskItem.nextSibling;

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