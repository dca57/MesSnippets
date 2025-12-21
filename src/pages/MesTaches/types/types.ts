
export type Status = 'todo' | 'analysis' | 'doing' | 'blocked' | 'review' | 'done' | 'archived';

// Subset of statuses specifically for Projects
export type ProjectStatus = 'todo' | 'doing' | 'done';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Project {
  id: string;
  client: string; // Free text input, replaces MissionId
  name: string;
  description?: string;
  status: ProjectStatus; // Limited to 3 levels
  modeGestionCharge: boolean; // true = Auto (Tasks sum), false = Manual
  manualEstimated: number; // In minutes
  manualSpent: number; // In minutes
  deadline?: string; // ISO String (YYYY-MM-DD)
  createdAt: string;
  wiki?: Record<string, string>; // Section Name -> Content
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  notes?: string;
  recettes?: string; // Scénarios de test / QA (Local only)
  subtasks: Subtask[]; // Checklist
  status: Status;
  priority: Priority;
  difficulty: Difficulty;
  isPinned: boolean;
  order: number; // Position for sorting
  estimatedDuration: number; // In minutes
  spentDuration: number; // In seconds
  isRunning: boolean;
  lastStartedAt: string | null; // ISO string
  
  // New Date Fields for Gantt
  startDate?: string; // ISO String (YYYY-MM-DD)
  dueDate?: string; // ISO String (YYYY-MM-DD)

  createdAt: string;
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'À faire',
  analysis: 'En analyse',
  doing: 'En cours',
  blocked: 'Blocage',
  review: 'En recettes',
  done: 'Terminé',
  archived: 'Archivée'
};

// Ordre de tri pour la vue liste (Status DESC comme demandé)
export const STATUS_ORDER: Record<Status, number> = {
  done: 0,
  review: 1,
  blocked: 2,
  doing: 3,
  analysis: 4,
  todo: 5,
  archived: 6
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  todo: 'À faire',
  doing: 'En cours',
  done: 'Terminé'
};

export const PRIORITY_CONFIG: Record<Priority, { label: string, color: string, bg: string }> = {
  low: { label: 'Faible', color: 'text-blue-800', bg: 'bg-blue-200' },
  normal: { label: 'Normale', color: 'text-emerald-700', bg: 'bg-emerald-200' },
  high: { label: 'Haute', color: 'text-orange-800', bg: 'bg-orange-200' },
  urgent: { label: 'Urgente', color: 'text-red-800', bg: 'bg-red-200' }
};

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string, color: string }> = {
  easy: { label: 'Facile', color: 'text-green-500' },
  medium: { label: 'Normale', color: 'text-yellow-500' },
  hard: { label: 'Difficile', color: 'text-orange-500' },
  expert: { label: 'Expert', color: 'text-red-600' }
};
