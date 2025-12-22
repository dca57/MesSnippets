import { supabase } from "../../../supabase/config";
import { Project, Task } from "../types/types";

/**
 * Service API pour synchroniser les données avec Supabase.
 * Tables : sni_taches_projects, sni_taches_tasks
 */

// --- READ (Load Initial Data) ---

export const apiFetchAllProjects = async (): Promise<Project[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sni_taches_projects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    client: p.client,
    name: p.name,
    status: p.status,
    modeGestionCharge: p.mode_gestion_charge,
    manualEstimated: p.manual_estimated,
    manualSpent: p.manual_spent,
    createdAt: p.created_at,
    wiki: p.wiki,
  }));
};

export const apiFetchAllTasks = async (): Promise<Task[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sni_taches_tasks")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    projectId: t.project_id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    difficulty: t.difficulty,
    isPinned: t.is_pinned,
    order: t.order_index,
    estimatedDuration: t.estimated_duration,
    spentDuration: t.spent_duration,
    notes: t.notes,
    recettes: t.recettes,
    subtasks: t.subtasks,
    createdAt: t.created_at,
    isRunning: false, // Runtime state, reset on load
    lastStartedAt: null // Runtime state
  }));
};

// --- PROJECTS ---

export const apiCreateProject = async (project: Project) => {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.from("sni_taches_projects").upsert({
      id: project.id,
      user_id: session.user.id,
      client: project.client,
      name: project.name,
      status: project.status,
      mode_gestion_charge: project.modeGestionCharge,
      manual_estimated: project.manualEstimated,
      manual_spent: project.manualSpent,
      wiki: project.wiki || {}, 
      created_at: project.createdAt,
    });
  } catch (e) {
    console.error("Supabase Sync Error (Create Project):", e);
  }
};

export const apiUpdateProject = async (id: string, updates: Partial<Project>) => {
  if (!supabase) return;

  try {
    const dbUpdates: any = {};
    
    if (updates.client !== undefined) dbUpdates.client = updates.client;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.modeGestionCharge !== undefined) dbUpdates.mode_gestion_charge = updates.modeGestionCharge;
    if (updates.manualEstimated !== undefined) dbUpdates.manual_estimated = updates.manualEstimated;
    if (updates.manualSpent !== undefined) dbUpdates.manual_spent = updates.manualSpent;
    if (updates.wiki !== undefined) dbUpdates.wiki = updates.wiki;

    await supabase.from("sni_taches_projects").update(dbUpdates).eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Update Project):", e);
  }
};

export const apiDeleteProject = async (id: string) => {
  if (!supabase) return;
  try {
    await supabase.from("sni_taches_projects").delete().eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Delete Project):", e);
  }
};

// --- TASKS ---

export const apiCreateTask = async (task: Task) => {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.from("sni_taches_tasks").upsert({
      id: task.id,
      user_id: session.user.id,
      project_id: task.projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      difficulty: task.difficulty,
      is_pinned: task.isPinned,
      order_index: task.order,
      spent_duration: task.spentDuration,
      estimated_duration: task.estimatedDuration,
      notes: task.notes,
      recettes: task.recettes,
      subtasks: task.subtasks,
      created_at: task.createdAt,
    });
  } catch (e) {
    console.error("Supabase Sync Error (Create Task):", e);
  }
};

export const apiUpdateTask = async (id: string, updates: Partial<Task>) => {
  if (!supabase) return;
  
  try {
    const dbUpdates: any = {};

    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.order !== undefined) dbUpdates.order_index = updates.order;
    if (updates.spentDuration !== undefined) dbUpdates.spent_duration = updates.spentDuration;
    if (updates.estimatedDuration !== undefined) dbUpdates.estimated_duration = updates.estimatedDuration;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.recettes !== undefined) dbUpdates.recettes = updates.recettes;
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;

    await supabase.from("sni_taches_tasks").update(dbUpdates).eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Update Task):", e);
  }
};

export const apiDeleteTask = async (id: string) => {
  if (!supabase) return;
  try {
    await supabase.from("sni_taches_tasks").delete().eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Delete Task):", e);
  }
};
