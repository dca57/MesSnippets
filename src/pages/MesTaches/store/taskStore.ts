import { create } from "zustand";
import { Project, Task, Status, ProjectStatus } from "../types/types";
import { supabase } from "../../../supabase/config";
import { computeProjectStatus } from "../helpers/projectLogic";
import { triggerCelebration } from "../helpers/uiLogic";
import { createTimeSlice, TimeSlice } from "./slices/timeSlice";
import * as api from "../services/api";

// Main State Interface combines Core State + Slices
export interface TaskState extends TimeSlice {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null;

  // Core Actions
  addProject: (client: string, name: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  moveProject: (id: string, newStatus: ProjectStatus) => void;

  addTask: (projectId: string, title: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  moveTaskToStatus: (id: string, newStatus: Status) => void;
  reorderTask: (activeTaskId: string, overTaskId: string) => void;
  toggleTaskPin: (id: string) => void;

  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  loadInitialData: () => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  (set, get, apiStore) => ({
    // 1. Initial Data
    projects: [],
    tasks: [],
    selectedProjectId: null,

    // 2. Include TimeSlice (Timer & Focus Logic)
    ...createTimeSlice(set, get, apiStore),

    // 3. Core Actions
    loadInitialData: async () => {
        try {
            const [fetchedProjects, fetchedTasks] = await Promise.all([
                api.apiFetchAllProjects(),
                api.apiFetchAllTasks()
            ]);
            
            console.log("Loaded from Supabase:", fetchedProjects.length, "projects,", fetchedTasks.length, "tasks");
            
            set({ projects: fetchedProjects, tasks: fetchedTasks });
        } catch (error) {
            console.error("Failed to load initial data", error);
        }
    },

    addProject: (client, name) =>
      set((state) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          client,
          name,
          status: "todo",
          modeGestionCharge: true,
          manualEstimated: 0,
          manualSpent: 0,
          createdAt: new Date().toISOString(),
          wiki: {}
        };

        // Sync API
        api.apiCreateProject(newProject);

        return { projects: [...state.projects, newProject] };
      }),

    updateProject: (id, updates) =>
      set((state) => {
        // Sync API
        api.apiUpdateProject(id, updates);

        return {
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        };
      }),

    deleteProject: (id) =>
      set((state) => {
        // Sync API
        api.apiDeleteProject(id);

        return {
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          selectedProjectId:
            state.selectedProjectId === id ? null : state.selectedProjectId,
          focusedTaskId:
            state.focusedTaskId === id ? null : state.focusedTaskId,
        };
      }),

    selectProject: (id) => set({ selectedProjectId: id }),

    moveProject: (id, newStatus) =>
      set((state) => {
        // Sync API
        api.apiUpdateProject(id, { status: newStatus });

        return {
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status: newStatus } : p
          ),
        };
      }),

    addTask: (projectId, title) =>
      set((state) => {
        const projectTasks = state.tasks.filter(
          (t) => t.projectId === projectId
        );
        const maxOrder =
          projectTasks.length > 0
            ? Math.max(...projectTasks.map((t) => t.order))
            : 0;

        const newTask: Task = {
            id: crypto.randomUUID(),
          projectId,
          title,
          status: "todo",
          priority: "normal",
          difficulty: "easy",
          isPinned: false,
          order: maxOrder + 100,
          subtasks: [],
          estimatedDuration: 0,
          spentDuration: 0,
          isRunning: false,
          lastStartedAt: null,
          createdAt: new Date().toISOString(),
        };

        // Sync API
        api.apiCreateTask(newTask);

        const updatedTasks = [...state.tasks, newTask];
        const project = state.projects.find((p) => p.id === projectId);
        const newProjectStatus = project
          ? computeProjectStatus(projectId, updatedTasks, project.status)
          : "todo";

        return {
          tasks: updatedTasks,
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, status: newProjectStatus } : p
          ),
          lastModifiedTaskId: newTask.id, // NEW: Track modification
        };
      }),

    updateTask: (id, updates) =>
      set((state) => {
        // Sync API
        api.apiUpdateTask(id, updates);

        const updatedTasks = state.tasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        );
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return { tasks: updatedTasks };

        if (updates.status === "done" && task.status !== "done") {
          triggerCelebration();
        }

        const project = state.projects.find((p) => p.id === task.projectId);
        const newProjectStatus = project
          ? computeProjectStatus(task.projectId, updatedTasks, project.status)
          : "todo";

        return {
          tasks: updatedTasks,
          projects: state.projects.map((p) =>
            p.id === task.projectId ? { ...p, status: newProjectStatus } : p
          ),
          lastModifiedTaskId: id, // NEW: Track modification
        };
      }),

    deleteTask: (id) =>
      set((state) => {
        // Sync API
        api.apiDeleteTask(id);

        const task = state.tasks.find((t) => t.id === id);
        const updatedTasks = state.tasks.filter((t) => t.id !== id);
        const newFocused =
          state.focusedTaskId === id ? null : state.focusedTaskId;

        if (task) {
          const project = state.projects.find((p) => p.id === task.projectId);
          const newProjectStatus = project
            ? computeProjectStatus(
                task.projectId,
                updatedTasks,
                project.status
              )
            : "todo";
          return {
            tasks: updatedTasks,
            projects: state.projects.map((p) =>
              p.id === task.projectId ? { ...p, status: newProjectStatus } : p
            ),
            focusedTaskId: newFocused,
          };
        }
        return { tasks: updatedTasks, focusedTaskId: newFocused };
      }),

    moveTaskToStatus: (id, newStatus) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (!task || task.status === newStatus) return {};

        if (newStatus === "done") {
          triggerCelebration();
        }

        const targetTasks = state.tasks.filter(
          (t) => t.projectId === task.projectId && t.status === newStatus
        );
        const maxOrder =
          targetTasks.length > 0
            ? Math.max(...targetTasks.map((t) => t.order))
            : 0;

        // Sync API
        api.apiUpdateTask(id, { status: newStatus, order: maxOrder + 100 });

        const updatedTasks = state.tasks.map((t) =>
          t.id === id ? { ...t, status: newStatus, order: maxOrder + 100 } : t
        );

        const project = state.projects.find((p) => p.id === task.projectId);
        const newProjectStatus = project
          ? computeProjectStatus(task.projectId, updatedTasks, project.status)
          : "todo";

        return {
          tasks: updatedTasks,
          projects: state.projects.map((p) =>
            p.id === task.projectId ? { ...p, status: newProjectStatus } : p
          ),
          lastModifiedTaskId: id, // NEW: Track modification
        };
      }),

    reorderTask: (activeTaskId, overTaskId) =>
      set((state) => {
        const activeTask = state.tasks.find((t) => t.id === activeTaskId);
        const overTask = state.tasks.find((t) => t.id === overTaskId);

        if (
          !activeTask ||
          !overTask ||
          activeTask.projectId !== overTask.projectId
        )
          return {};

        const statusGroup = state.tasks
          .filter(
            (t) =>
              t.projectId === activeTask.projectId &&
              t.status === activeTask.status
          )
          .sort((a, b) => a.order - b.order);

        const oldIndex = statusGroup.findIndex((t) => t.id === activeTaskId);
        const newIndex = statusGroup.findIndex((t) => t.id === overTaskId);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
          return {};

        const newGroup = [...statusGroup];
        const [movedItem] = newGroup.splice(oldIndex, 1);
        newGroup.splice(newIndex, 0, movedItem);

        const updates: Record<string, number> = {};
        newGroup.forEach((t, index) => {
          updates[t.id] = (index + 1) * 100;
        });

        // Sync API - Batch update would be better, but loop is fine for now
        Object.entries(updates).forEach(([tId, order]) => {
          api.apiUpdateTask(tId, { order });
        });

        return {
          tasks: state.tasks.map((t) =>
            updates[t.id] !== undefined ? { ...t, order: updates[t.id] } : t
          ),
          lastModifiedTaskId: activeTaskId, // NEW: Track modification (active task moved)
        };
      }),

    toggleTaskPin: (id) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          api.apiUpdateTask(id, { isPinned: !task.isPinned });
        }
        return {
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isPinned: !t.isPinned } : t
          ),
          lastModifiedTaskId: id, // NEW: Track modification
        };
      }),

    // Subtasks are stored as JSONB in 'tasks' table, so we update the parent task
    addSubtask: (taskId, title) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return {};
        const newSubtasks = [
          ...task.subtasks,
          { id: crypto.randomUUID(), title, completed: false }, 
        ];

        api.apiUpdateTask(taskId, { subtasks: newSubtasks });

        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: newSubtasks } : t
          ),
          lastModifiedTaskId: taskId, // NEW: Track modification
        };
      }),

    toggleSubtask: (taskId, subtaskId) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return {};
        const newSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        api.apiUpdateTask(taskId, { subtasks: newSubtasks });

        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: newSubtasks } : t
          ),
          lastModifiedTaskId: taskId, // NEW: Track modification
        };
      }),

    updateSubtask: (taskId, subtaskId, title) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return {};
        const newSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, title } : st
        );

        api.apiUpdateTask(taskId, { subtasks: newSubtasks });

        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: newSubtasks } : t
          ),
          lastModifiedTaskId: taskId, // NEW: Track modification
        };
      }),

    deleteSubtask: (taskId, subtaskId) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return {};
        const newSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);

        api.apiUpdateTask(taskId, { subtasks: newSubtasks });

        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: newSubtasks } : t
          ),
          lastModifiedTaskId: taskId, // NEW: Track modification
        };
      }),
  })
);
