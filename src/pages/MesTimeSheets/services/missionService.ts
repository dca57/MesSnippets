import { supabase } from "../../../supabase/config";
import { Mission, Timesheet } from "../types/types";
import { MOCK_MISSIONS } from "../data/mockData";

// Cette version remplace le stockage local par Supabase.
// Si Supabase n'est pas configuré (pas de clés dans .env), il fallback sur les Mocks pour la lecture (mode démo).

export const MissionService = {
  // --- Missions ---
  getMissions: async (): Promise<Mission[]> => {
    if (!supabase) {
      console.warn("Supabase not configured, returning mocks.");
      return MOCK_MISSIONS;
    }

    // RLS filters automatically by user_id
    const { data, error } = await supabase
      .from("sni_missions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching missions:", error);
      return [];
    }
    return data || [];
  },

  saveMission: async (mission: Mission): Promise<void> => {
    if (!supabase) return;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to save mission");

    // On utilise 'any' ici pour éviter les erreurs TypeScript strictes si les types locaux
    // ne correspondent pas exactement à ceux générés par Supabase.
    const toSave: any = { ...mission, user_id: user.id };

    // IMPORTANT : Si l'ID est une chaîne vide (cas d'une création), on le supprime
    // pour que PostgreSQL génère automatiquement un UUID valide.
    if (!toSave.id) {
      delete toSave.id;
    }

    // Nettoyage des timestamps s'ils sont undefined (laisser la DB gérer les défauts)
    if (!toSave.created_at) delete toSave.created_at;
    if (!toSave.updated_at) delete toSave.updated_at;

    const { error } = await supabase.from("sni_missions").upsert(toSave);

    if (error) console.error("Error saving mission:", error);
  },

  deleteMission: async (id: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.from("sni_missions").delete().eq("id", id);

    if (error) console.error("Error deleting mission:", error);
  },

  // --- Timesheets ---

  getTimesheets: async (): Promise<Timesheet[]> => {
    if (!supabase) return [];
    // Updated table name: sni_timesheets
    const { data, error } = await supabase.from("sni_timesheets").select("*");
    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  },

  // Récupère uniquement les métadonnées (mois/année) pour l'historique d'une mission
  getMissionHistory: async (
    missionId: string
  ): Promise<{ month: number; year: number }[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("sni_timesheets")
      .select("month, year")
      .eq("missionId", missionId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
      return [];
    }
    return data || [];
  },

  getTimesheet: async (
    missionId: string,
    month: number,
    year: number
  ): Promise<Timesheet | null> => {
    if (!supabase) return null;

    // Updated table name: sni_timesheets
    const { data, error } = await supabase
      .from("sni_timesheets")
      .select("*")
      .eq("missionId", missionId)
      .eq("month", month)
      .eq("year", year)
      .single();

    if (error) {
      // Code PGRST116 signifie "Aucune ligne trouvée", ce qui est normal pour un nouveau mois
      if (error.code !== "PGRST116") {
        console.error("Error fetching timesheet:", error);
      }
      return null;
    }

    return data as Timesheet;
  },

  saveTimesheet: async (timesheet: Timesheet): Promise<void> => {
    if (!supabase) return;

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be logged in to save timesheet");

    const toSave: any = { ...timesheet, user_id: user.id };

    // Assure que l'ID existe ou est généré
    if (!toSave.id) {
      toSave.id = crypto.randomUUID();
    }

    // Nettoyage des timestamps
    if (!toSave.created_at) delete toSave.created_at;
    if (!toSave.updated_at) delete toSave.updated_at;

    // Updated table name: sni_timesheets
    const { error } = await supabase.from("sni_timesheets").upsert(toSave);

    if (error) {
      console.error("Error saving timesheet:", error);
      throw error;
    }
  },

  resetData: () => {
    window.location.reload();
  },
};
