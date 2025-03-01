import { Signal } from "signal-polyfill";

export function createTask(taskText) {
    const text = new Signal.State(taskText);
    const taskSubtasks = new Signal.State([]);

    return {
        id: Date.now().toString(),
        text: text, 
        subtasks: taskSubtasks, 
        canDelete: new Signal.Computed(() => 
            taskSubtasks.get().every(subtask => subtask.completed.get())
        )
    };
}

// For redoing objects that have been taken from local-storage
export function makeTask(taskId, taskText, subtasks) {
    const text = new Signal.State(taskText);
    const taskSubtasks = new Signal.State(subtasks || []);
    console.log(subtasks)

    return {
        id: taskId,
        text: text, 
        subtasks: taskSubtasks, 
        canDelete: new Signal.Computed(() => 
            taskSubtasks.get().every(subtask => subtask.completed.get())
        )
    };
}

export function createSubtask(subtaskText) {
    const text = new Signal.State(subtaskText);

    return { 
        id: Date.now().toString(), 
        text: text, 
        completed: new Signal.State(false) 
    };
}