import { supabase } from "../../../supabase/config";
import { Project, Task } from "../types/types";

const STORAGE_KEY = "sni-timesheets-storage";

export const migrateToSupabase = async () => {
  if (!supabase) {
    console.error("Supabase client not initialized");
    return { success: false, error: "Supabase client not initialized" };
  }

  const { data: { session }, error: authError } = await supabase.auth.getSession();
  if (authError || !session) {
    console.error("User not authenticated", authError);
    return { success: false, error: "User not authenticated" };
  }

  const userId = session.user.id;

  try {
    // 1. Read LocalStorage
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      console.warn("No local data found to migrate.");
      return { success: true, message: "No local data found." };
    }

    const parsed = JSON.parse(rawData);
    const projects: Project[] = parsed.state?.projects || [];
    const tasks: Task[] = parsed.state?.tasks || [];

    console.log(`Migrating ${projects.length} projects and ${tasks.length} tasks...`);

    // 2. Migrate Projects
    if (projects.length > 0) {
      const dbProjects = projects.map(p => ({
        id: p.id,
        user_id: userId,
        name: p.name,
        client: p.client,
        status: p.status,
        mode_gestion_charge: p.modeGestionCharge,
        manual_estimated: p.manualEstimated,
        manual_spent: p.manualSpent,
        wiki: p.wiki || {}, // JSONB
        created_at: p.createdAt
        // updated_at is handled by trigger or defaults to now()
      }));

      const { error: pError } = await supabase
        .from('sni_taches_projects')
        .upsert(dbProjects, { onConflict: 'id' });

      if (pError) throw pError;
    }

    // 3. Migrate Tasks
    if (tasks.length > 0) {
      const dbTasks = tasks.map(t => ({
        id: t.id,
        user_id: userId,
        project_id: t.projectId,
        title: t.title,
        status: t.status,
        priority: t.priority,
        difficulty: t.difficulty,
        is_pinned: t.isPinned,
        order_index: t.order,
        spent_duration: t.spentDuration,
        estimated_duration: t.estimatedDuration,
        notes: t.notes,
        recettes: t.recettes, // Text field
        subtasks: t.subtasks || [], // JSONB
        created_at: t.createdAt
      }));

      const { error: tError } = await supabase
        .from('sni_taches_tasks')
        .upsert(dbTasks, { onConflict: 'id' });

      if (tError) throw tError;
    }

    console.log("Migration successful!");
    return { success: true, projectsCount: projects.length, tasksCount: tasks.length };

  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
};
