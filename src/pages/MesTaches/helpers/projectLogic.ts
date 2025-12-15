
import { Task, ProjectStatus } from '../types/types';

// Helper to check and update project status based on tasks
export const computeProjectStatus = (projectId: string, currentTasks: Task[], currentProjectStatus: ProjectStatus): ProjectStatus => {
  const projectTasks = currentTasks.filter(t => t.projectId === projectId);
  
  if (projectTasks.length === 0) return currentProjectStatus;

  // Rule 1: If at least one task is doing/running -> Project Doing
  const hasActiveTask = projectTasks.some(t => t.status === 'doing' || t.isRunning);
  if (hasActiveTask) return 'doing';

  // Rule 2: If ALL tasks are done -> Project Done
  const allTasksDone = projectTasks.every(t => t.status === 'done' || t.status === 'archived');
  if (allTasksDone && projectTasks.length > 0) return 'done';

  return currentProjectStatus;
};
