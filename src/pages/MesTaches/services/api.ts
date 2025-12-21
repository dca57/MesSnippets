import { supabase } from "../../../supabase/config";
import { Project, Task } from "../types/types";

/**
 * Service API pour synchroniser les données avec Supabase.
 * Fonctionne en "Fire and Forget" : si l'utilisateur n'est pas connecté,
 * ou si une erreur survient, cela ne bloque pas l'interface locale.
 */

// --- PROJECTS ---

export const apiCreateProject = async (project: Project) => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.from("projects").upsert({
      id: project.id,
      user_id: session.user.id,
      client: project.client,
      name: project.name,
      status: project.status,
      mode_gestion_charge: project.modeGestionCharge,
      manual_estimated: project.manualEstimated,
      manual_spent: project.manualSpent,
      created_at: project.createdAt,
    });
    // Note: wiki is local-only for now, so we don't send it to Supabase
  } catch (e) {
    console.error("Supabase Sync Error (Create Project):", e);
  }
};

export const apiUpdateProject = async (
  id: string,
  updates: Partial<Project>
) => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  try {
    // Map camelCase to snake_case for DB if needed
    const dbUpdates: any = { ...updates };
    // Exclude wiki from DB updates as it is local for now
    delete dbUpdates.wiki;

    if (updates.modeGestionCharge !== undefined)
      dbUpdates.mode_gestion_charge = updates.modeGestionCharge;
    if (updates.manualEstimated !== undefined)
      dbUpdates.manual_estimated = updates.manualEstimated;
    if (updates.manualSpent !== undefined)
      dbUpdates.manual_spent = updates.manualSpent;

    await supabase.from("projects").update(dbUpdates).eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Update Project):", e);
  }
};

export const apiDeleteProject = async (id: string) => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.from("projects").delete().eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Delete Project):", e);
  }
};

// --- TASKS ---

export const apiCreateTask = async (task: Task) => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.from("tasks").upsert({
      id: task.id,
      user_id: session.user.id, // Tasks also belong to user
      project_id: task.projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      difficulty: task.difficulty,
      is_pinned: task.isPinned,
      order_index: task.order,
      spent_duration: task.spentDuration,
      notes: task.notes,
      // recettes is local-only, not sent to DB
      subtasks: task.subtasks, // Stored as JSONB
      created_at: task.createdAt,
    });
  } catch (e) {
    console.error("Supabase Sync Error (Create Task):", e);
  }
};

export const apiUpdateTask = async (id: string, updates: Partial<Task>) => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  try {
    const dbUpdates: any = { ...updates };
    // Exclude recettes from DB updates as it is local for now
    delete dbUpdates.recettes;

    if (updates.projectId !== undefined)
      dbUpdates.project_id = updates.projectId;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.estimatedDuration !== undefined)
      dbUpdates.estimated_duration = updates.estimatedDuration;
    if (updates.spentDuration !== undefined)
      dbUpdates.spent_duration = updates.spentDuration;
    if (updates.order !== undefined) dbUpdates.order_index = updates.order;
    // subtasks is JSON, handled automatically

    await supabase.from("tasks").update(dbUpdates).eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Update Task):", e);
  }
};

export const apiDeleteTask = async (id: string) => {
  if (!supabase) return;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase.from("tasks").delete().eq("id", id);
  } catch (e) {
    console.error("Supabase Sync Error (Delete Task):", e);
  }
};
