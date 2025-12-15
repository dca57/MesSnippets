
import { StateCreator } from 'zustand';
import { TaskState } from '../taskStore';
import { computeProjectStatus } from '../../helpers/projectLogic';

export interface TimeSlice {
  isFocusMode: boolean;
  focusedTaskId: string | null;
  lastModifiedTaskId: string | null; // NEW: Track last modified task

  toggleTaskTimer: (taskId: string) => void;
  enterFocusMode: (taskId: string) => void;
  toggleFocusMode: () => void;
}

export const createTimeSlice: StateCreator<TaskState, [], [], TimeSlice> = (set, get) => ({
  isFocusMode: false,
  focusedTaskId: null,
  lastModifiedTaskId: null,

  toggleTaskTimer: (taskId) => set((state) => {
    const now = new Date().toISOString();
    let isNowRunning = false;
    let newFocusedTaskId = state.focusedTaskId;

    // 1. Update Tasks (Start/Stop logic)
    const updatedTasks = state.tasks.map(t => {
      // Logic for the clicked task
      if (t.id === taskId) {
        if (t.isRunning) {
          // STOP
          const start = new Date(t.lastStartedAt!).getTime();
          const end = new Date(now).getTime();
          const additionalSeconds = Math.floor((end - start) / 1000);
          return { 
            ...t, 
            isRunning: false, 
            lastStartedAt: null, 
            spentDuration: t.spentDuration + additionalSeconds 
          };
        } else {
          // START
          isNowRunning = true;
          newFocusedTaskId = taskId;
          return { 
            ...t, 
            isRunning: true, 
            lastStartedAt: now, 
            // Auto-move to 'doing' if in 'todo'/'analysis'
            status: (['todo', 'analysis', 'blocked'].includes(t.status)) ? 'doing' : t.status 
          };
        }
      }
      
      // Logic for other running tasks (Auto-stop them if we start a new one? 
      // Current logic: Stop other running tasks to have only 1 active timer)
      if (t.isRunning) {
         const start = new Date(t.lastStartedAt!).getTime();
         const end = new Date(now).getTime();
         const additionalSeconds = Math.floor((end - start) / 1000);
         return { ...t, isRunning: false, lastStartedAt: null, spentDuration: t.spentDuration + additionalSeconds };
      }
      return t;
    });

    // 2. Update Projects Status (based on new task statuses)
    const task = state.tasks.find(t => t.id === taskId);
    let updatedProjects = state.projects;
    if (task) {
         const project = state.projects.find(p => p.id === task.projectId);
         const newProjectStatus = project ? computeProjectStatus(task.projectId, updatedTasks, project.status) : 'todo';
         updatedProjects = state.projects.map(p => p.id === task.projectId ? { ...p, status: newProjectStatus } : p);
    }

    // 3. Auto-Trigger Focus Mode if starting
    let newFocusMode = state.isFocusMode;
    if (isNowRunning) {
        newFocusMode = true;
    }

    return {
      tasks: updatedTasks,
      projects: updatedProjects,
      isFocusMode: newFocusMode,
      focusedTaskId: newFocusedTaskId
    };
  }),

  enterFocusMode: (taskId) => set({
      focusedTaskId: taskId,
      isFocusMode: true
  }),

  toggleFocusMode: () => set((state) => {
    // Entering Focus Mode logic
    if (!state.isFocusMode) {
      // Priority 1: If there is a last modified task, check if it still exists
      if (state.lastModifiedTaskId) {
        const lastModTask = state.tasks.find(t => t.id === state.lastModifiedTaskId);
        if (lastModTask) {
          return { isFocusMode: true, focusedTaskId: state.lastModifiedTaskId };
        }
      }
      // Priority 2: Fallback to currently focused or running/active logic (controlled by focusedTaskId)
      return { isFocusMode: true };
    }
    
    // Exiting Focus Mode
    return { isFocusMode: false };
  })
});
